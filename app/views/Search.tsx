import React, { useState, useCallback, useEffect } from 'react';
import type { Track } from '../types';
import { searchVideos } from '../services/youtube';
import TrackCard from '../components/TrackCard';

interface SearchProps {
  onPlay: (track: Track, trackList: Track[]) => void;
  onNavigateToChannel: (channelId: string) => void;
  searchQuery: string;
}

const Search: React.FC<SearchProps> = ({ onPlay, onNavigateToChannel, searchQuery }) => {
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError('Failed to perform search. Please check your YouTube API key.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center">Searching...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }

    if (!searchQuery) {
      return (
        <div className="text-center text-gray-500 pt-16">
          <h2 className="text-xl font-bold">Find your next favorite track.</h2>
          <p>Use the search bar in the header to get started.</p>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="text-center text-gray-500">
          No results found for "{searchQuery}".
        </div>
      );
    }

    return (
      <>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Showing results for "{searchQuery}"
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

  return <div>{renderContent()}</div>;
};

export default Search;