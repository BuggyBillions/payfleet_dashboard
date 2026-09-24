import React from 'react';
import { Link } from 'react-router-dom';
import type { SearchResult } from '../../lib/interfaces';
import { IoSearchOutline } from 'react-icons/io5';

interface SearchResultsPopupProps {
  results: SearchResult[];
  isLoading: boolean;
  searchQuery: string;
}

const SearchResultsPopup: React.FC<SearchResultsPopupProps> = ({ results, isLoading, searchQuery }) => {
  return (
    <div className="absolute top-full mt-2 w-full bg-secondary rounded-lg shadow-lg border border-primary/10 z-10">
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : results.length > 0 ? (
        <ul>
          {results.map((result, index) => (
            <li key={index} className="border-b border-primary/5 last:border-b-0">
              <Link to={result.url} className="block p-4 hover:bg-primary/5">
                <h4 className="font-semibold">{result.title}</h4>
                <p className="text-sm text-gray-600">{result.snippet}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : searchQuery ? (
        <div className="p-4 text-center text-gray-500 flex flex-col items-center gap-2">
            <IoSearchOutline size={24} />
            <span>No results found for "{searchQuery}"</span>
        </div>
      ) : null}
    </div>
  );
};

export default SearchResultsPopup;
