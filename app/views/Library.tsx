import React, { useEffect, useState } from 'react';
import type { Playlist, Track } from '../types';
import { getPlaylistItems } from '../services/youtube';
import { getPlaylist as getFirebasePlaylist } from '../services/firebase';

interface LibraryProps {
  playlists: Playlist[];
  onPlay: (track: Track, trackList: Track[]) => void;
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlistId: string) => void;
  onNavigateToChannel: (channelId: string) => void;
}

const Library: React.FC<LibraryProps> = ({ playlists, onPlay, selectedPlaylistId, onSelectPlaylist, onNavigateToChannel }) => {
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  
  const selectedPlaylistInfo = playlists.find(p => p.id === selectedPlaylistId) || null;

  useEffect(() => {
    if (!selectedPlaylistId && playlists.length > 0) {
      onSelectPlaylist(playlists[0].id);
    }
  }, [playlists, selectedPlaylistId, onSelectPlaylist]);

  useEffect(() => {
    const fetchTracks = async () => {
      if (selectedPlaylistInfo) {
        setLoadingTracks(true);
        setActivePlaylist(null); // Clear previous playlist tracks
        try {
          let playlistWithTracks;
          if (selectedPlaylistInfo.source === 'youtube') {
             const tracks = await getPlaylistItems(selectedPlaylistInfo.id);
             playlistWithTracks = { ...selectedPlaylistInfo, tracks };
          } else {
             // It's a firebase playlist, fetch its full data
             playlistWithTracks = await getFirebasePlaylist(selectedPlaylistInfo.id);
          }
          setActivePlaylist(playlistWithTracks);
        } catch (error) {
          console.error("Failed to load playlist tracks:", error);
          setActivePlaylist(selectedPlaylistInfo); // Show playlist info even if tracks fail
        } finally {
          setLoadingTracks(false);
        }
      }
    };
    fetchTracks();
  }, [selectedPlaylistId, selectedPlaylistInfo]);

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
      </div>
      
      {playlists.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-4">
            {playlists.map(p => (
              <button 
                key={p.id} 
                onClick={() => onSelectPlaylist(p.id)}
                className={`p-4 rounded-lg text-left transition-all duration-200 transform hover:-translate-y-1 ${selectedPlaylistId === p.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'bg-gray-200 dark:bg-gray-900/50 hover:bg-gray-300 dark:hover:bg-gray-800'}`}
              >
                <div className="flex items-center space-x-2">
                    {p.source === 'youtube' && <span className="material-symbols-outlined text-sm opacity-80">podcasts</span>}
                    <h3 className="font-bold truncate">{p.name}</h3>
                </div>
                <p className="text-sm opacity-80">{p.trackCount} {p.trackCount === 1 ? 'track' : 'tracks'}</p>
              </button>
            ))}
          </div>

          {activePlaylist && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{activePlaylist.name}</h2>
              <div className="space-y-2">
                {loadingTracks ? (
                  <p className="text-gray-500 dark:text-gray-400">Loading tracks...</p>
                ) : activePlaylist.tracks && activePlaylist.tracks.length > 0 ? (
                  activePlaylist.tracks.map((track, index) => (
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
                      <button onClick={() => onPlay(track, activePlaylist.tracks)} className="ml-4 p-2 opacity-0 group-hover:opacity-100 text-gray-800 dark:text-gray-200 transition-opacity">
                        <span className="material-symbols-outlined">play_arrow</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">This playlist is empty.</p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 pt-16 flex flex-col items-center">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">music_note</span>
          <h2 className="text-xl font-bold">Your library is empty.</h2>
          <p className="mb-6">Create a playlist or connect your YouTube account to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Library;