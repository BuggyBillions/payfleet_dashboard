import React, { useState, useEffect, useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { PiBellSimple } from "react-icons/pi";
import { searchApi } from "../../helpers/api";
import SearchResultsPopup from "./SearchResultsPopup";
import { assets } from "../../assets/assets";
import type { SearchResult } from "../../lib/interfaces";

interface TopNavProps {
  showSearchBar?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ showSearchBar = true }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        setIsLoading(true);
        setIsPopupVisible(true);
        searchApi(searchQuery).then((res) => {
          setResults(res);
          setIsLoading(false);
        });
      } else {
        setIsPopupVisible(false);
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  return (
    <div className="w-full py-2 flex gap-3 items-center justify-between">
      <img src={assets.logo} alt="Platform Logo" className="w-10" />
      <div className="flex gap-6 items-center">
        {showSearchBar && (
          <div className="relative min-w-92" ref={searchContainerRef}>
            <label
              htmlFor="searchBox"
              className="border border-primary/10 rounded-lg bg-secondary md:flex hidden gap-2 items-center h-10 w-full px-2"
            >
              <IoSearchOutline size={18} />
              <input
                type="text"
                id="searchBox"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setIsPopupVisible(true)}
                className="border-0 outline-0 h-full w-full text-xs bg-secondary"
                placeholder="Search property"
                autoComplete="off"
              />
            </label>
            {isPopupVisible && (
              <SearchResultsPopup
                results={results}
                isLoading={isLoading}
                searchQuery={searchQuery}
              />
            )}
          </div>
        )}

        <Link to="">
          <PiBellSimple
            size={20}
            className="text-gray-600 hover:text-gray-900 transition"
          />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20 uppercase flex items-center justify-center font-medium">
            <img src={assets.logo} alt="Platform Logo" className="w-8" />
          </div>
          <div className="leading-2">
            <h3 className="truncate m-0 font-medium text-sm">
              Damola Oyegbemile
            </h3>
            <small className="uppercase font-medium text-[10px]">
              Admin manager
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
