import React, { useState, useCallback, useEffect } from 'react';
import type { Track } from '../types';
import { searchVideos } from '../services/youtube';
import TrackCard from '../components/TrackCard';

interface SearchProps {
  onPlay: (track: Track, trackList: Track[]) => void;
  onNavigateToChannel: (channelId: string) => void;
  searchHistory: string[];
  onSearch: (query: string) => void;
  onClearHistory: () => void;
  locationSearch: string;
}

const Search: React.FC<SearchProps> = ({
  onPlay, onNavigateToChannel,
  searchHistory, onSearch, onClearHistory,
  locationSearch
}) => {
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [inputQuery, setInputQuery] = useState('');

  const performSearch = useCallback(async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const searchResults = await searchVideos(query);
      setResults(searchResults);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred during search.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryFromUrl = new URLSearchParams(locationSearch).get('q') || '';
    setCurrentQuery(queryFromUrl);
    setInputQuery(queryFromUrl);
    if (queryFromUrl) {
      performSearch(queryFromUrl);
    } else {
      setResults([]); // Clear results if query is removed
    }
  }, [locationSearch, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(inputQuery);
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center">Searching...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500" dangerouslySetInnerHTML={{ __html: error }} />;
    }

    if (!currentQuery) {
      if (searchHistory.length === 0) {
        return (
          <div className="text-center text-gray-500 pt-16">
            <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">search</span>
            <h2 className="text-xl font-bold">Find your next favorite track.</h2>
            <p>Use the search bar above to get started.</p>
          </div>
        );
      }

      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Searches</h2>
            <button onClick={onClearHistory} className="text-sm text-gray-500 hover:text-brand-500">Clear History</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <button
                key={`${term}-${index}`}
                onClick={() => onSearch(term)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="text-center text-gray-500">
          No results found for "{currentQuery}".
        </div>
      );
    }

    return (
      <>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Showing results for "{currentQuery}"
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map(track => (
            <TrackCard
              key={track.videoId}
              track={track}
              trackList={results}
              onPlay={onPlay}
              onNavigateToChannel={onNavigateToChannel}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl mx-auto mb-8">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Search for tracks, artists, or channels..."
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
          autoFocus
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <span className="material-symbols-outlined text-2xl">search</span>
        </div>
      </form>
      {renderContent()}
    </div>
  );
};

export default Search;