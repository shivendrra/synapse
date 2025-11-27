import React from 'react';
import type { Playlist, Track } from '../../types';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  playlists: Playlist[];
  onSelectPlaylist: (playlistId: string, track: Track) => void;
  onCreateNewPlaylist: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  track,
  playlists,
  onSelectPlaylist,
  onCreateNewPlaylist,
}) => {
  if (!isOpen || !track) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add to playlist</h2>
        
        <button 
            onClick={onCreateNewPlaylist}
            className="flex items-center w-full p-3 text-left text-sm font-semibold rounded-md transition-colors duration-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
             <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                <span className="material-symbols-outlined">add</span>
            </div>
            Create new playlist
        </button>

        <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
        
        <ul className="space-y-1 flex-1 overflow-y-auto max-h-64">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <button
                onClick={() => onSelectPlaylist(playlist.id, track)}
                className="flex items-center w-full p-2 text-left text-sm rounded-md transition-colors duration-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <img src={playlist.thumbnail} alt={playlist.name} className="w-10 h-10 rounded-md object-cover mr-3" />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{playlist.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{playlist.trackCount} tracks</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
