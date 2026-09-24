import { useState, useEffect, useRef } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import api from "../../helpers/api";
import type { SearchableInputProps } from "../../lib/interfaces";

// Example usage
/*
  <SearchableInput
    endpoint="/your endpoint"
    placeholder="your placeholder..."
    onSelect={handleStaffSelect}
    displayKey="name" // the key on each object for it to display
    dataKey="data" // the data to be search for in the response. Use . for nested responses E.g (data.data)
    initialValue={akey} // optional but works
    className="w-full md:text-base text-sm border-gray-300 rounded-lg indent-3 h-12 border outline-0"
  />
*/

const SearchableInput = <T extends object>({
  endpoint,
  onSelect,
  onInputChange,
  displayKey = "name" as keyof T,
  queryParam = "search",
  label,
  placeholder = "Search...",
  className = "",
  inputContClassName = "",
  dataKey,
  initialValue = "",
  showIcon = true,
  fetchOnEmpty = false,
}: SearchableInputProps<T>) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSelecting = useRef(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (isSelecting.current) {
        isSelecting.current = false; // Reset for next time
        return;
      }

      if (!fetchOnEmpty && (!query || query.trim().length === 0)) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get(endpoint, {
          params: { [queryParam]: query },
        });

        // Determine where the array is located
        let data = response.data;
        if (dataKey) {
          // Traverse the data object if dataKey contains dots (e.g. "data.results")
          const keys = dataKey.split(".");
          for (const key of keys) {
            if (data && data[key]) {
              data = data[key];
            } else {
              data = [];
              break;
            }
          }
        } else if (data.data && Array.isArray(data.data)) {
          // Common Laravel common resource pattern response.data.data
          data = data.data;
        }

        if (Array.isArray(data)) {
          setResults(data);
          setShowDropdown(true);
        } else {
          setResults([]);
          console.warn("SearchableInput: API response is not an array", data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch results");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query, fetchOnEmpty, endpoint, queryParam, dataKey]);

  const handleSelect = (item: T) => {
    isSelecting.current = true;
    setQuery(String(item[displayKey] || ""));
    setShowDropdown(false);
    onSelect(item);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className={`flex items-center h-12.5 px-2 ${inputContClassName}`}>
        <div className="pointer-events-none">
          {loading ? (
            <FaSpinner className="animate-spin text-gray-400 ms-2" />
          ) : (
            showIcon && <FaSearch className="text-gray-400" />
          )}
        </div>

        <input
          type="text"
          className="h-full indent-3 outline-0 w-full placeholder-gray-500 focus:outline-none text-sm transition duration-150 ease-in-out"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            onInputChange?.(value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
      </div>

      {showDropdown &&
        (results.length > 0 ||
          error ||
          (query && results.length === 0 && !loading)) && (
          <div className="absolute z-10 index-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base border border-black/15 overflow-auto focus:outline-none sm:text-sm">
            {error && (
              <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-red-500">
                {error}
              </div>
            )}

            {!error && results.length === 0 && !loading && (
              <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                No results found.
              </div>
            )}

            {results.map((item, index) => (
              <div
                key={`result_${(item as { id?: string | number }).id ?? index}`}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary/5 group duration-500 transition-all"
                onClick={() => handleSelect(item)}
              >
                <span className="block truncate font-normal group-hover:font-semibold duration-100 transition-all">
                  {String(item[displayKey])}
                </span>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default SearchableInput;
