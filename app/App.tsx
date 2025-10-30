import React, { useState, useEffect, useCallback } from 'react';
import type { User, Track, Playlist, Subscription } from './types';
import { auth, onLoginWithGoogle, signInWithEmail, signUpWithEmail, onLogout, getUserData, saveYouTubeToken, clearYouTubeToken } from './services/firebase';
import { initClient as initGoogleClient, requestYouTubeAccess, revokeYouTubeAccess, getCurrentUserProfile } from './services/googleAuth';
import { getUserPlaylists as getYouTubePlaylists, getSubscriptionFeed } from './services/youtube';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Player from './components/Player';
import Home from './views/Home';
import Search from './views/Search';
import Library from './views/Library';
import Login from './views/Login';
import Channel from './views/Channel';
import Profile from './views/Profile';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import { createPlaylist as createFbPlaylist, getPlaylists as getFbPlaylists } from './services/firebase';


type ViewName = 'Home' | 'Search' | 'Library' | 'Channel' | 'Profile';
interface View {
  name: ViewName;
  id?: string; // e.g., channelId
}

const InitializationError: React.FC<{ message: string | null }> = ({ message }) => {
  const isApiKeyError = message?.includes('API key not valid') || message?.includes('API key is invalid');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="w-full max-w-lg mx-4 p-8 bg-white dark:bg-gray-900/50 rounded-xl shadow-2xl text-center">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Application Initialization Failed</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The application could not start due to a configuration issue.
        </p>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left text-sm font-mono text-red-500 dark:text-red-400 overflow-x-auto">
          <code>{message || 'An unknown error occurred.'}</code>
        </div>
        {isApiKeyError && (
          <div className="mt-6 p-4 border-l-4 border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 text-left text-yellow-800 dark:text-yellow-300">
            <h3 className="font-bold">API Key Issue Detected</h3>
            <p className="mt-1 text-sm">
              This error indicates that the YouTube API Key is invalid. Please verify the following:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The <code>API_KEY</code> environment variable is set correctly.</li>
                <li>The key is enabled for the <strong>YouTube Data API v3</strong> in your Google Cloud project.</li>
                <li>The key does not have any HTTP referrer or IP address restrictions that would block access from this application.</li>
              </ul>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [initState, setInitState] = useState<'pending' | 'success' | 'error'>('pending');
  const [initError, setInitError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation state
  const [history, setHistory] = useState<View[]>([{ name: 'Home' }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentView = history[historyIndex];

  // Player state
  const [playbackContext, setPlaybackContext] = useState<{ list: Track[], index: number }>({ list: [], index: -1 });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const { list: contextList, index: contextIndex } = playbackContext;
  const currentTrack = contextIndex > -1 ? contextList[contextIndex] : null;

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isYtApiReady, setIsYtApiReady] = useState(false);

  // Mobile UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlayerMaximized, setIsPlayerMaximized] = useState(false);

  const [isCreatePlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
  const [createPlaylistError, setCreatePlaylistError] = useState<string | null>(null);

  const navigate = useCallback((view: View) => {
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
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    (window as any).onYouTubeIframeAPIReady = () => setIsYtApiReady(true);
    if ((window as any).YT && (window as any).YT.Player) setIsYtApiReady(true);

    const initializeApp = async () => {
      try {
        await initGoogleClient();
        setInitState('success');
      } catch (err: any) {
        console.error("Fatal: Failed to initialize Google Client:", err);
        setInitError(err.message || 'An unknown error occurred during initialization.');
        setInitState('error');
      }
    };
    initializeApp();
  }, []);

  const fetchYouTubeData = useCallback(async (uid: string) => {
    try {
      const profile = await getCurrentUserProfile();
      if (profile) {
        setCurrentUser(prev => ({ ...prev!, ...profile }));
        const [ytPlaylists, ytSubscriptions] = await Promise.all([
          getYouTubePlaylists(),
          getSubscriptionFeed()
        ]);
        setPlaylists(prev => [...prev.filter(p => p.source === 'firebase'), ...ytPlaylists]);
        setSubscriptions(ytSubscriptions.slice(0, 12));
      } else {
        // User connected but has no YT channel, or token is invalid.
        await clearYouTubeToken(uid);
        setCurrentUser(prev => ({ ...prev!, channelId: undefined, photoURL: prev!.photoURL || '' }));
      }
    } catch (error) {
      console.error("Failed to fetch YouTube data, clearing token.", error);
      await clearYouTubeToken(uid);
    }
  }, []);

  const fetchFirebaseData = useCallback(async (uid: string) => {
    const fbPlaylists = await getFbPlaylists(uid);
    setPlaylists(prev => [...prev.filter(p => p.source === 'youtube'), ...fbPlaylists]);
  }, []);

  useEffect(() => {
    if (initState !== 'success') return;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser.uid);
        const user: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          youtubeToken: userData?.youtubeToken || null,
        };
        setCurrentUser(user);
        await fetchFirebaseData(firebaseUser.uid);
        if (user.youtubeToken) {
          (window as any).gapi.client.setToken(user.youtubeToken);
          await fetchYouTubeData(firebaseUser.uid);
        }
      } else {
        setCurrentUser(null);
        setPlaylists([]);
        setSubscriptions([]);
        setHistory([{ name: 'Home' }]);
        setHistoryIndex(0);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [initState, fetchFirebaseData, fetchYouTubeData]);


  const handleConnectYouTube = async () => {
    if (!currentUser) return;
    try {
      const token = await requestYouTubeAccess();
      await saveYouTubeToken(currentUser.uid, token);
      await fetchYouTubeData(currentUser.uid);
    } catch (error) {
      console.error("Failed to connect YouTube account:", error);
    }
  };

  const handleDisconnectYouTube = async () => {
    if (!currentUser?.youtubeToken) return;
    try {
      await revokeYouTubeAccess(currentUser.youtubeToken.access_token);
      await clearYouTubeToken(currentUser.uid);
      setCurrentUser(prev => ({ ...prev!, youtubeToken: null, channelId: undefined }));
      setPlaylists(prev => prev.filter(p => p.source === 'firebase'));
      setSubscriptions([]);
    } catch (error) {
      console.error("Failed to disconnect YouTube account:", error);
    }
  };

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleLogout = useCallback(() => {
    onLogout();
  }, []);

  const playTrack = useCallback((track: Track, trackList: Track[] = []) => {
    const list = trackList.length > 0 ? trackList : [track];
    const trackIndex = list.findIndex(t => t.videoId === track.videoId);

    setPlaybackContext({ list, index: trackIndex });
    setIsPlaying(true);

    if (window.innerWidth < 768) {
      setIsPlayerMaximized(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(prev => !prev);
    }
  }, [currentTrack]);

  const playNext = useCallback(() => {
    if (contextIndex < contextList.length - 1) {
      setPlaybackContext(prev => ({ ...prev, index: prev.index + 1 }));
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setPlaybackContext({ list: [], index: -1 });
    }
  }, [contextList, contextIndex]);

  const playPrev = useCallback(() => {
    if (contextIndex > 0) {
      setPlaybackContext(prev => ({ ...prev, index: prev.index - 1 }));
      setIsPlaying(true);
    }
  }, [contextIndex]);

  const addToQueue = useCallback((track: Track) => {
    setPlaybackContext(prev => {
      if (prev.list.some(t => t.videoId === track.videoId)) {
        return prev;
      }
      const newList = [...prev.list, track];
      if (prev.index === -1) {
        setIsPlaying(true);
        return { list: newList, index: 0 };
      }
      return { ...prev, list: newList };
    });
  }, []);

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    navigate({ name: 'Library' });
    setIsSidebarOpen(false);
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

  const handleCreatePlaylist = async (name: string) => {
    if (!currentUser) return;
    try {
      await createFbPlaylist(name, currentUser);
      setCreatePlaylistError(null);
      setCreatePlaylistModalOpen(false);
      // Refetch playlists
      const fbPlaylists = await getFbPlaylists(currentUser.uid);
      setPlaylists(prev => [...prev.filter(p => p.source === 'youtube'), ...fbPlaylists]);
    } catch (error: any) {
      setCreatePlaylistError(error.message);
    }
  };

  const renderView = () => {
    if (authLoading) {
      return <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">Loading user...</div>;
    }
    if (!currentUser) return <Login onGoogleLogin={onLoginWithGoogle} onEmailLogin={signInWithEmail} onEmailSignUp={signUpWithEmail} />;

    switch (currentView.name) {
      case 'Home':
        return <Home onPlay={playTrack} onNavigateToChannel={handleNavigateToChannel} subscriptions={subscriptions} />;
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
          onNavigateToChannel={handleNavigateToChannel}
        />;
      case 'Channel':
        return <Channel
          channelId={currentView.id!}
          onPlay={playTrack}
          onNavigateToChannel={handleNavigateToChannel}
        />;
      case 'Profile':
        return <Profile
          user={currentUser}
          onConnectYouTube={handleConnectYouTube}
          onDisconnectYouTube={handleDisconnectYouTube}
        />;
      default:
        return <Home onPlay={playTrack} onNavigateToChannel={handleNavigateToChannel} subscriptions={subscriptions} />;
    }
  };

  if (initState === 'pending') {
    return <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black">Initializing...</div>;
  }
  if (initState === 'error') {
    return <InitializationError message={initError} />;
  }

  const mainContentPb = currentUser ? (isPlayerMaximized ? 'pb-0' : 'pb-24 md:pb-24') : 'pb-0';


  return (
    <div className={`w-full min-h-screen font-sans text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-black transition-colors duration-300`}>
      <div className="flex h-screen">
        {currentUser && <Sidebar
          currentView={currentView.name}
          onNavigate={handleNavigate}
          playlists={playlists}
          onSelectPlaylist={handleSelectPlaylist}
          selectedPlaylistId={selectedPlaylistId}
          onCreatePlaylist={() => setCreatePlaylistModalOpen(true)}
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
            onNavigate={navigate}
          />
          }
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {renderView()}
          </div>
        </main>
      </div>

      <CreatePlaylistModal
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => setCreatePlaylistModalOpen(false)}
        onCreate={handleCreatePlaylist}
        error={createPlaylistError}
        onClearError={() => setCreatePlaylistError(null)}
      />

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
          onNavigateToChannel={handleNavigateToChannel}
          isYtApiReady={isYtApiReady}
          isMaximized={isPlayerMaximized}
          onToggleMaximize={() => setIsPlayerMaximized(prev => !prev)}
        />
      )}
    </div>
  );
}
