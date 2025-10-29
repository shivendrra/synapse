
import React, { useEffect } from 'react';
import type { Playlist, Track } from '../types';

interface LibraryProps {
  playlists: Playlist[];
  onPlay: (track: Track, trackList: Track[]) => void;
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlistId: string) => void;
  onOpenCreatePlaylistModal: () => void;
  onNavigateToChannel: (channelId: string) => void;
}

const Library: React.FC<LibraryProps> = ({ playlists, onPlay, selectedPlaylistId, onSelectPlaylist, onOpenCreatePlaylistModal, onNavigateToChannel }) => {

  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId) || null;

  useEffect(() => {
    // If there's no selected playlist but there are playlists available, select the first one.
    if (!selectedPlaylist && playlists.length > 0) {
      onSelectPlaylist(playlists[0].id);
    }
  }, [playlists, selectedPlaylist, onSelectPlaylist]);

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Library</h1>
        <button onClick={onOpenCreatePlaylistModal} className="flex items-center gap-2 bg-brand-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-brand-700 transition-colors">
          <span className="material-symbols-outlined">add</span>
          <span>New Playlist</span>
        </button>
      </div>

      {playlists.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map(p => (
              <button
                key={p.id}
                onClick={() => onSelectPlaylist(p.id)}
                className={`p-4 rounded-lg text-left transition-all duration-200 transform hover:-translate-y-1 ${selectedPlaylistId === p.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'bg-gray-200 dark:bg-gray-900/50 hover:bg-gray-300 dark:hover:bg-gray-800'}`}
              >
                <h3 className="font-bold truncate">{p.name}</h3>
                <p className="text-sm opacity-80">{p.trackCount} {p.trackCount === 1 ? 'track' : 'tracks'}</p>
              </button>
            ))}
          </div>

          {selectedPlaylist && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{selectedPlaylist.name}</h2>
              <div className="space-y-2">
                {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 ? (
                  selectedPlaylist.tracks.map((track, index) => (
                    <div key={track.videoId} className="group flex items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="w-8 text-center text-gray-500 dark:text-gray-400">{index + 1}</div>
                      <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded-md ml-4 object-cover" />
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{track.title}</p>
                        <button onClick={() => onNavigateToChannel(track.channelId)} className="text-xs text-left text-gray-600 dark:text-gray-400 truncate hover:underline">
                          {track.artist}
                        </button>
                      </div>
                      <div className="hidden md:block w-24 text-sm text-gray-500 dark:text-gray-400 text-right">
                        {formatDuration(track.duration)}
                      </div>
                      <button onClick={() => onPlay(track, selectedPlaylist.tracks)} className="ml-4 p-2 opacity-0 group-hover:opacity-100 text-gray-800 dark:text-gray-200 transition-opacity">
                        <span className="material-symbols-outlined">play_arrow</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">This playlist is empty. Add some tracks!</p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 pt-16 flex flex-col items-center">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">music_note</span>
          <h2 className="text-xl font-bold">Your library is empty.</h2>
          <p className="mb-6">Create a new playlist to get started.</p>
          <button onClick={onOpenCreatePlaylistModal} className="bg-brand-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-brand-700 transition-colors">
            Create Playlist
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;
