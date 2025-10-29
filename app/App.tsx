import React, { useState, useEffect, useCallback } from 'react';
import type { User, Track, Playlist } from './types';
import { auth, onLoginWithGoogle, onLogout, getPlaylists, addTrackToPlaylist, signInWithEmail, signUpWithEmail, createPlaylist as createPlaylistInDb, removeTrackFromPlaylist } from './services/firebase';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Player from './components/Player';
import Home from './views/Home';
import Search from './views/Search';
import Library from './views/Library';
import Login from './views/Login';
import Channel from './views/Channel';
import CreatePlaylistModal from './components/CreatePlaylistModal';

type ViewName = 'Home' | 'Search' | 'Library' | 'Channel';
interface View {
    name: ViewName;
    id?: string; // e.g., channelId
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation state
  const [history, setHistory] = useState<View[]>([{ name: 'Home' }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentView = history[historyIndex];

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [playlistCreationError, setPlaylistCreationError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isYtApiReady, setIsYtApiReady] = useState(false);
  
  // Mobile UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlayerMaximized, setIsPlayerMaximized] = useState(false);

  const navigate = useCallback((view: View) => {
    // Prevent pushing the same view consecutively
    const lastView = history[historyIndex];
    if (lastView.name === view.name && lastView.id === view.id) {
        return;
    }
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(view);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
        setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
        setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  useEffect(() => {
    (window as any).onYouTubeIframeAPIReady = () => {
      setIsYtApiReady(true);
    };

    if ((window as any).YT && (window as any).YT.Player) {
      setIsYtApiReady(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      if (user) {
        const userData: User = {
          uid: user.uid,
          name: user.displayName || 'No Name',
          email: user.email || '',
          photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        };
        setCurrentUser(userData);

        let userPlaylists = await getPlaylists(user.uid);
        
        const likedSongsPlaylist = userPlaylists.find(p => p.name === 'Liked Songs');

        if (likedSongsPlaylist) {
            // Move to front if it exists
            userPlaylists = [
                likedSongsPlaylist,
                ...userPlaylists.filter(p => p.id !== likedSongsPlaylist.id)
            ];
        } else {
            // Create and prepend if it doesn't
            const newPlaylistId = await createPlaylistInDb('Liked Songs', userData);
            const newLikedPlaylist: Playlist = {
                id: newPlaylistId,
                name: 'Liked Songs',
                ownerId: user.uid,
                ownerName: userData.name,
                tracks: [],
                trackCount: 0,
            };
            userPlaylists.unshift(newLikedPlaylist);
        }
        
        setPlaylists(userPlaylists);

        if (userPlaylists.length > 0) {
            setSelectedPlaylistId(userPlaylists[0].id);
        }
        setHistory([{ name: 'Home' }]);
        setHistoryIndex(0);
      } else {
        setCurrentUser(null);
        setPlaylists([]);
        setSelectedPlaylistId(null);
        setHistory([{ name: 'Home' }]);
        setHistoryIndex(0);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleLogout = useCallback(async () => {
    await onLogout();
  }, []);

  const playTrack = useCallback((track: Track, trackList: Track[] = []) => {
    const trackIndex = trackList.findIndex(t => t.videoId === track.videoId);
    const newQueue = trackIndex !== -1 ? trackList.slice(trackIndex + 1) : [];
    setCurrentTrack(track);
    setQueue(newQueue);
    setIsPlaying(true);
    setIsPlayerMaximized(false); // Start with mini-player on mobile
  }, []);

  const togglePlay = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(prev => !prev);
    }
  }, [currentTrack]);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      const newQueue = queue.slice(1);
      setCurrentTrack(nextTrack);
      setQueue(newQueue);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  }, [queue]);

  const playPrev = useCallback(() => {}, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prevQueue => {
      if (prevQueue.find(t => t.videoId === track.videoId) || currentTrack?.videoId === track.videoId) {
        return prevQueue;
      }
      return [...prevQueue, track];
    });
  }, [currentTrack]);

  const handleAddToPlaylist = useCallback(async (playlistId: string, track: Track) => {
    if (!currentUser) return;
    try {
        await addTrackToPlaylist(playlistId, track);
        setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId) {
            const trackExists = p.tracks.some(t => t.videoId === track.videoId);
            if (trackExists) return p;
            const newTracks = [...p.tracks, track];
            return {
              ...p,
              tracks: newTracks,
              trackCount: newTracks.length
            };
          }
          return p;
        }));
    } catch(error) {
        console.error("Error adding track to playlist:", error);
    }
  }, [currentUser]);

  const handleToggleLike = useCallback(async (track: Track) => {
    if (!currentUser) return;

    const likedSongsPlaylist = playlists.find(p => p.name === 'Liked Songs');
    if (!likedSongsPlaylist) {
        console.error("'Liked Songs' playlist not found!");
        return;
    }

    const trackExists = likedSongsPlaylist.tracks.some(t => t.videoId === track.videoId);

    try {
        if (trackExists) {
            await removeTrackFromPlaylist(likedSongsPlaylist.id, track);
            setPlaylists(prev => prev.map(p => {
                if (p.id === likedSongsPlaylist.id) {
                    const newTracks = p.tracks.filter(t => t.videoId !== track.videoId);
                    return { ...p, tracks: newTracks, trackCount: newTracks.length };
                }
                return p;
            }));
        } else {
            await addTrackToPlaylist(likedSongsPlaylist.id, track);
            setPlaylists(prev => prev.map(p => {
                if (p.id === likedSongsPlaylist.id) {
                    if (p.tracks.some(t => t.videoId === track.videoId)) return p;
                    const newTracks = [...p.tracks, track];
                    return { ...p, tracks: newTracks, trackCount: newTracks.length };
                }
                return p;
            }));
        }
    } catch (error) {
        console.error("Failed to toggle like status:", error);
    }
  }, [currentUser, playlists]);
  
  const handleCreatePlaylist = async (name: string) => {
    if (!currentUser || !name.trim()) return;
    setPlaylistCreationError(null);
    try {
        const newPlaylistId = await createPlaylistInDb(name, currentUser);
        const newPlaylist: Playlist = {
            id: newPlaylistId,
            name,
            ownerId: currentUser.uid,
            ownerName: currentUser.name,
            tracks: [],
            trackCount: 0,
        };
        setPlaylists(prev => [...prev, newPlaylist]);
        setSelectedPlaylistId(newPlaylistId);
        navigate({ name: 'Library' });
        setIsCreatePlaylistModalOpen(false);
    } catch(error: any) {
        console.error("Failed to create playlist:", error);
        if (error.code === 'permission-denied') {
            setPlaylistCreationError("Permission Denied: Your Firestore security rules are preventing playlist creation. Please update them to allow authenticated users to write to the 'playlists' collection.");
        } else {
            setPlaylistCreationError(`An unexpected error occurred: ${error.message}`);
        }
    }
  };
  
  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    navigate({ name: 'Library' });
    setIsSidebarOpen(false); // Close sidebar on selection
  };
  
  const handleNavigate = (viewName: ViewName) => {
    navigate({ name: viewName });
    setIsSidebarOpen(false);
  }
  const handleNavigateToChannel = (channelId: string) => navigate({ name: 'Channel', id: channelId });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate({ name: 'Search' });
  };
  
  const likedSongsPlaylist = playlists.find(p => p.name === 'Liked Songs');
  const isCurrentTrackLiked = !!(likedSongsPlaylist && currentTrack && likedSongsPlaylist.tracks.some(t => t.videoId === currentTrack.videoId));

  const renderView = () => {
    if (authLoading) {
        return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
    }
    if (!currentUser) return <Login 
        onLoginWithGoogle={onLoginWithGoogle}
        onSignInWithEmail={signInWithEmail}
        onSignUpWithEmail={signUpWithEmail}
      />;

    switch (currentView.name) {
      case 'Home':
        return <Home onPlay={playTrack} onNavigateToChannel={handleNavigateToChannel} />;
      case 'Search':
        return <Search 
            onPlay={playTrack} 
            onNavigateToChannel={handleNavigateToChannel}
            searchQuery={searchQuery}
        />;
      case 'Library':
        return <Library 
            playlists={playlists} 
            onPlay={playTrack}
            selectedPlaylistId={selectedPlaylistId}
            onSelectPlaylist={setSelectedPlaylistId}
            onOpenCreatePlaylistModal={() => setIsCreatePlaylistModalOpen(true)}
            onNavigateToChannel={handleNavigateToChannel}
        />;
      case 'Channel':
        return <Channel 
            channelId={currentView.id!} 
            onPlay={playTrack} 
            onNavigateToChannel={handleNavigateToChannel} 
        />;
      default:
        return <Home onPlay={playTrack} onNavigateToChannel={handleNavigateToChannel} />;
    }
  };

  const mainContentPb = currentUser ? (isPlayerMaximized ? 'pb-0' : 'pb-24 md:pb-24') : 'pb-0';


  return (
    <div className={`w-full min-h-screen font-sans text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-black transition-colors duration-300`}>
      <div className="flex h-screen">
        {currentUser && <Sidebar 
            currentView={currentView.name} 
            onNavigate={handleNavigate}
            playlists={playlists}
            onOpenCreatePlaylistModal={() => setIsCreatePlaylistModalOpen(true)}
            onSelectPlaylist={handleSelectPlaylist}
            selectedPlaylistId={selectedPlaylistId}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />}
        
        <main className={`flex-1 flex flex-col h-screen overflow-hidden ${mainContentPb}`}>
          {currentUser && <Header 
              user={currentUser} 
              onLogout={handleLogout} 
              toggleTheme={toggleTheme}
              theme={theme}
              onBack={goBack}
              onForward={goForward}
              canGoBack={historyIndex > 0}
              canGoForward={historyIndex < history.length - 1}
              onSearch={handleSearch}
              currentView={currentView.name}
              onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            />
          }
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {renderView()}
          </div>
        </main>
      </div>

      {currentUser && currentTrack && (
        <Player
          key={currentTrack.videoId}
          track={currentTrack}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onTogglePlay={togglePlay}
          onNext={playNext}
          onPrev={playPrev}
          onAddToQueue={addToQueue}
          onAddToPlaylist={handleAddToPlaylist}
          playlists={playlists}
          onNavigateToChannel={handleNavigateToChannel}
          onToggleLike={handleToggleLike}
          isCurrentTrackLiked={isCurrentTrackLiked}
          isYtApiReady={isYtApiReady}
          isMaximized={isPlayerMaximized}
          onToggleMaximize={() => setIsPlayerMaximized(prev => !prev)}
        />
      )}

      <CreatePlaylistModal 
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => setIsCreatePlaylistModalOpen(false)}
        onCreate={handleCreatePlaylist}
        error={playlistCreationError}
        onClearError={() => setPlaylistCreationError(null)}
      />
    </div>
  );
}