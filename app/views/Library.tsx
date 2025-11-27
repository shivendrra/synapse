import React, { useEffect, useState, useRef } from 'react';
import type { Playlist, Track } from '../types';
import { getPlaylistItems } from '../services/youtube';
import { getPlaylist as getFirebasePlaylist } from '../services/firebase';
import PlaylistCard from '../components/PlaylistCard';

interface LibraryProps {
  playlists: Playlist[];
  onPlay: (track: Track, trackList: Track[]) => void;
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlistId: string) => void;
  onNavigateToChannel: (channelId: string) => void;
  onLikeToggle: (track: Track, isLiked: boolean) => void;
  likedTracks: Track[];
  onAddToPlaylist: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onRemoveFromPlaylist: (playlistId: string, track: Track) => void;
}

const Library: React.FC<LibraryProps> = ({ 
  playlists, onPlay, selectedPlaylistId, onSelectPlaylist, onNavigateToChannel,
  onLikeToggle, likedTracks, onAddToPlaylist, onAddToQueue, onRemoveFromPlaylist
}) => {
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [optionsMenu, setOptionsMenu] = useState<{ track: Track, top: number, left: number } | null>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  
  const selectedPlaylistInfo = playlists.find(p => p.id === selectedPlaylistId) || null;

  useEffect(() => {
    // Automatically select a default playlist if none is selected
    if (!selectedPlaylistId && playlists.length > 0) {
      const likedSongsPlaylist = playlists.find(p => p.specialType === 'liked-songs');
      if (likedSongsPlaylist) {
        onSelectPlaylist(likedSongsPlaylist.id);
      } else {
        onSelectPlaylist(playlists[0].id);
      }
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
  
  // Effect to handle closing the options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setOptionsMenu(null);
      }
    };
    if (optionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionsMenu, optionsMenuRef]);

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const isTrackLiked = (track: Track) => likedTracks.some(t => t.videoId === track.videoId);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Library</h1>
      </div>
      
      {playlists.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {playlists.map(p => (
              <PlaylistCard 
                key={p.id}
                playlist={p}
                isSelected={selectedPlaylistId === p.id}
                onSelect={onSelectPlaylist}
              />
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8">
            {activePlaylist && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{activePlaylist.name}</h2>
                <div className="space-y-1">
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
                        <div className="flex items-center ml-4">
                          <div className="hidden md:block w-24 text-sm text-gray-500 dark:text-gray-400 text-right">
                            {formatDuration(track.duration)}
                          </div>
                          <button onClick={() => onPlay(track, activePlaylist.tracks)} className="p-2 opacity-0 group-hover:opacity-100 text-gray-800 dark:text-gray-200 transition-opacity">
                            <span className="material-symbols-outlined">play_arrow</span>
                          </button>
                           <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setOptionsMenu({ track, top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                            }}
                             className="p-2 opacity-0 group-hover:opacity-100 text-gray-800 dark:text-gray-200 transition-opacity"
                           >
                            <span className="material-symbols-outlined">more_horiz</span>
                           </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">This playlist is empty.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 pt-16 flex flex-col items-center">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">queue_music</span>
          <h2 className="text-xl font-bold">Your library is empty.</h2>
          <p className="mb-6">Create a playlist or connect your YouTube account to get started.</p>
        </div>
      )}
      
      {optionsMenu && (
        <div 
            ref={optionsMenuRef}
            style={{ top: `${optionsMenu.top}px`, left: `${optionsMenu.left}px` }}
            className="fixed z-30 w-52 bg-white dark:bg-gray-900 rounded-md shadow-2xl p-1 ring-1 ring-black ring-opacity-5 transform -translate-x-full"
        >
            <button
                onClick={() => { onAddToQueue(optionsMenu.track); setOptionsMenu(null); }}
                className="w-full flex items-center text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
                <span className="material-symbols-outlined mr-3">queue_music</span> Add to queue
            </button>
            <button
                onClick={() => {
                    onLikeToggle(optionsMenu.track, isTrackLiked(optionsMenu.track));
                    setOptionsMenu(null);
                }}
                className="w-full flex items-center text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
                <span className="material-symbols-outlined mr-3" style={{ fontVariationSettings: `'FILL' ${isTrackLiked(optionsMenu.track) ? 1 : 0}` }}>favorite</span> {isTrackLiked(optionsMenu.track) ? 'Unlike' : 'Like'}
            </button>
            <button
                onClick={() => { onAddToPlaylist(optionsMenu.track); setOptionsMenu(null); }}
                className="w-full flex items-center text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
                <span className="material-symbols-outlined mr-3">playlist_add</span> Add to playlist
            </button>
            {activePlaylist?.source === 'firebase' && activePlaylist.specialType !== 'liked-songs' && (
              <>
                <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                <button
                    onClick={() => {
                        onRemoveFromPlaylist(activePlaylist.id, optionsMenu.track);
                        setOptionsMenu(null);
                    }}
                    className="w-full flex items-center text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                >
                    <span className="material-symbols-outlined mr-3">delete</span> Remove from playlist
                </button>
              </>
            )}
        </div>
    )}

    </div>
  );
};

export default Library;
