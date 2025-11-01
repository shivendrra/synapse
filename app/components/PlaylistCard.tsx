import React from 'react';
import type { Playlist } from '../types';

interface PlaylistCardProps {
  playlist: Playlist;
  isSelected: boolean;
  onSelect: (playlistId: string) => void;
}

const gradients = [
  'from-pink-400 to-purple-500',
  'from-green-400 to-blue-500',
  'from-yellow-400 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-indigo-400 to-violet-500',
  'from-red-400 to-yellow-500',
];

// Simple hash function to get a consistent gradient for each playlist
const getGradientIndex = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % gradients.length);
};


const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, isSelected, onSelect }) => {
  
  const isLikedSongs = playlist.specialType === 'liked-songs';
  const gradientClass = isLikedSongs 
    ? 'from-indigo-500 to-purple-600'
    : gradients[getGradientIndex(playlist.id)];

  return (
    <div 
      onClick={() => onSelect(playlist.id)}
      className={`group relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-900/50 hover:bg-gray-300 dark:hover:bg-gray-800 transition-all duration-300 p-3 cursor-pointer ${isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-black ring-brand-500' : ''}`}
    >
      <div className="relative w-full aspect-[4/3]">
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} rounded-md flex items-center justify-center`}>
            <span 
                className="material-symbols-outlined text-5xl text-white/80"
                style={{ fontVariationSettings: isLikedSongs ? `'FILL' 1` : '' }}
            >
              {isLikedSongs ? 'favorite' : 'queue_music'}
            </span>
          </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate" title={playlist.name}>
          {playlist.name}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
          {playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'}
        </p>
      </div>
    </div>
  );
};

export default PlaylistCard;
