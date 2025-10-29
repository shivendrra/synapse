
import React from 'react';
import type { Track } from '../types';

interface TrackCardProps {
  track: Track;
  trackList?: Track[];
  onPlay: (track: Track, trackList: Track[]) => void;
  onNavigateToChannel: (channelId: string) => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, trackList = [], onPlay, onNavigateToChannel }) => {
  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's play functionality if we implement that later
    onNavigateToChannel(track.channelId);
  }

  return (
    <div className="group relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-900/50 hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors duration-300 p-3">
      <div className="relative">
        <img src={track.thumbnail} alt={track.title} className="w-full h-auto aspect-video object-cover rounded-md" />
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(track.duration)}
        </div>
        <button 
          onClick={() => onPlay(track, trackList)}
          className="absolute bottom-2 right-2 w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:bottom-4 transition-all duration-300 ease-in-out transform hover:scale-110"
          aria-label={`Play ${track.title}`}
        >
          <span className="material-symbols-outlined text-3xl">play_arrow</span>
        </button>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate" title={track.title}>{track.title}</h3>
        <button onClick={handleArtistClick} className="text-xs text-gray-600 dark:text-gray-400 truncate hover:underline text-left">
            {track.artist}
        </button>
      </div>
    </div>
  );
};

export default TrackCard;
