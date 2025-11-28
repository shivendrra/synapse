import React, { useState, useEffect, useCallback } from 'react';
import type { User, Track, Playlist, Subscription } from './types';
import { auth, onLoginWithGoogle, signInWithEmail, signUpWithEmail, onLogout, getUserData, saveYouTubeToken, clearYouTubeToken, ensureUserDocument, reauthenticateUser, updateUserPassword, deleteUserAccount, updateUserProfile } from './services/firebase';
import { initClient as initGoogleClient, requestYouTubeAccess, revokeYouTubeAccess, getCurrentUserProfile } from './services/googleAuth';
import { getUserPlaylists as getYouTubePlaylists, getSubscriptionFeed, getChannelVideos } from './services/youtube';

import { Sidebar } from './components/Sidebar';
import Header from './components/Header';
import Player from './components/Player';
import Home from './views/Home';
import Search from './views/Search';
import Library from './views/Library';
import Login from './views/Login';
import Channel from './views/Channel';
import Profile from './views/Profile';
import Settings from './views/Settings';
import Subscriptions from './views/Subscriptions';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import AddToPlaylistModal from './components/modals/AddToPlaylistModal';
import { createPlaylist as createFbPlaylist, getPlaylists as getFbPlaylists, likeTrack, unlikeTrack, addTrackToPlaylist as addTrackToFbPlaylist, removeTrackFromPlaylist } from './services/firebase';
import ErrorBoundary from './components/ErrorBoundary';


const InitializationError: React.FC<{ message: string | null }> = ({ message }) => {
  const getGuidance = () => {
    const guidance: { key: string; variable: string; link: string }[] = [];
    const lowerCaseMessage = message?.toLowerCase() || '';

    if (lowerCaseMessage.includes('firebase')) {
      guidance.push({
        key: 'Firebase API Key',
        variable: 'FIREBASE_API_KEY',
        link: 'https://console.firebase.google.com/',
      });
    }

    if (lowerCaseMessage.includes('youtube') || lowerCaseMessage.includes('api key is invalid')) {
      guidance.push({
        key: 'YouTube Data API Key',
        variable: 'YOUTUBE_API_KEY',
        link: 'https://console.cloud.google.com/apis/library/youtube.googleapis.com',
      });
    }

    if (lowerCaseMessage.includes('google client id')) {
      guidance.push({
        key: 'Google OAuth 2.0 Client ID',
        variable: 'GOOGLE_CLIENT_ID',
        link: 'https://console.cloud.google.com/apis/credentials',
      });
    }

    // If no specific key is mentioned, assume all might be needed.
    if (guidance.length === 0) {
      return [
        { key: 'Firebase API Key', variable: 'FIREBASE_API_KEY', link: 'https://console.firebase.google.com/' },
        { key: 'YouTube Data API Key', variable: 'YOUTUBE_API_KEY', link: 'https://console.cloud.google.com/apis/library/youtube.googleapis.com' },
        { key: 'Google OAuth 2.0 Client ID', variable: 'GOOGLE_CLIENT_ID', link: 'https://console.cloud.google.com/apis/credentials' },
      ];
    }

    return guidance;
  };

  const keyIssues = getGuidance();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="w-full max-w-2xl mx-4 p-8 bg-white dark:bg-gray-900/50 rounded-xl shadow-2xl">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Application Configuration Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The application failed to start because one or more required API keys are missing or invalid.
          </p>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left text-sm font-mono text-red-500 dark:text-red-400 overflow-x-auto mb-6">
            <code>Error: {message || 'An unknown error occurred.'}</code>
          </div>
        </div>

        <div className="p-4 border-l-4 border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 text-left text-yellow-800 dark:text-yellow-300 rounded-r-lg">
          <h3 className="font-bold">Action Required: Configure Environment Variables</h3>
          <p className="mt-1 text-sm">
            To run this application, you need to provide the following API keys as environment variables.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-sm">
            {keyIssues.map(issue => (
              <li key={issue.variable}>
                Set <code>{issue.variable}</code> with your <strong>{issue.key}</strong>.
                <a href={issue.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline font-medium">
                  Get key <span className="material-symbols-outlined text-xs align-middle">open_in_new</span>
                </a>
              </li>
            ))}
          </ul>
          {message?.includes('API key is invalid') && (
            <p className="mt-3 text-xs opacity-80">
              <strong>Tip:</strong> If you've set your <code>YOUTUBE_API_KEY</code> but still see an "invalid" error, ensure it's enabled for the <strong>YouTube Data API v3</strong> and has no IP/referrer restrictions preventing access.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const SessionError: React.FC<{ message: string, onLogout: () => void; }> = ({ message, onLogout }) => {
  const exampleRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Publicly readable usernames for profile lookups
    match /usernames/{username} {
      allow read: if true;
      allow write: if request.auth != null; // Restrict writes
    }
    
    // Allow users to read public profiles
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow users to manage their own playlists
    match /playlists/{playlistId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
  }
}
`.trim();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="w-full max-w-2xl mx-4 p-8 bg-white dark:bg-gray-900/50 rounded-xl shadow-2xl">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">gpp_maybe</span>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            There was a problem accessing your account data after logging in.
          </p>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left text-sm font-mono text-red-500 dark:text-red-400 overflow-x-auto mb-6">
            <code>Error: {message}</code>
          </div>
        </div>

        <div className="p-4 border-l-4 border-orange-500 bg-orange-100 dark:bg-orange-900/30 text-left text-orange-800 dark:text-orange-300 rounded-r-lg">
          <h3 className="font-bold">Most Likely Cause: Firestore Security Rules</h3>
          <p className="mt-1 text-sm">
            This error usually means the application doesn't have permission to read or create your user profile in the database.
            This is controlled by <strong>Firestore Security Rules</strong> in your Firebase project.
          </p>
          <p className="mt-3 text-sm font-semibold">Suggested Fix:</p>
          <p className="text-xs mt-1">
            Go to your Firebase Console → Firestore Database → Rules tab and update your rules to allow authenticated users to access their own data. Here is an example:
          </p>
          <pre className="mt-3 p-3 bg-gray-900 text-gray-200 rounded-md text-xs overflow-x-auto">
            <code>{exampleRules}</code>
          </pre>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const Redirect: React.FC<{ to: string, replace: boolean, message: string, navigate: (path: string, replace?: boolean) => void }> = ({ to, replace, message, navigate }) => {
  useEffect(() => {
    navigate(to, replace);
  }, [to, replace, navigate]);
  return <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">{message}</div>;
}


export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [initState, setInitState] = useState<'pending' | 'success' | 'error'>('pending');
  const [initError, setInitError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation state
  const getPathFromHash = () => {
    const hash = window.location.hash;
    return hash.startsWith('#') ? hash.substring(1) : '/';
  }
  const [location, setLocation] = useState(getPathFromHash());

  // Player state
  const [playbackContext, setPlaybackContext] = useState<{ list: Track[], index: number }>({ list: [], index: -1 });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const { list: contextList, index: contextIndex } = playbackContext;
  const currentTrack = contextIndex > -1 ? contextList[contextIndex] : null;
  const [isAudioOnly, setIsAudioOnly] = useState<boolean>(() => {
    return localStorage.getItem('audioOnly') === 'true';
  });

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [likedSongsPlaylist, setLikedSongsPlaylist] = useState<Playlist | null>(null);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionHomeFeed, setSubscriptionHomeFeed] = useState<Track[]>([]);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isYtApiReady, setIsYtApiReady] = useState(false);

  // Mobile UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlayerMaximized, setIsPlayerMaximized] = useState(false);

  // Modal State
  const [isCreatePlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
  const [createPlaylistError, setCreatePlaylistError] = useState<string | null>(null);
  const [trackForPlaylist, setTrackForPlaylist] = useState<Track | null>(null);

  // App Settings
  const [showYouTubePlaylists, setShowYouTubePlaylists] = useState<boolean>(() => {
    return localStorage.getItem('showYouTubePlaylists') !== 'false';
  });


  const navigate = useCallback((path: string, replace = false) => {
    const newHash = `#${path}`;
    if (replace) {
      // Construct the full URL with the new hash to replace the history entry
      const url = new URL(window.location.href);
      url.hash = newHash;
      window.location.replace(url.href);
    } else {
      // Simply setting the hash adds a new entry to the history
      window.location.hash = newHash;
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => setLocation(getPathFromHash());
    window.addEventListener('hashchange', onHashChange);
    // Set initial location on mount
    onHashChange();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goBack = useCallback(() => window.history.back(), []);
  const goForward = useCallback(() => window.history.forward(), []);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    (window as any).onYouTubeIframeAPIReady = () => setIsYtApiReady(true);
    if ((window as any).YT && (window as any).YT.Player) setIsYtApiReady(true);

    // Load search history from local storage
    try {
      const storedHistory = localStorage.getItem('searchHistory');
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse search history:", error);
      localStorage.removeItem('searchHistory');
    }

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
        setSubscriptions(ytSubscriptions);
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
    const allFbPlaylists = await getFbPlaylists(uid);
    const likedPlaylist = allFbPlaylists.find(p => p.specialType === 'liked-songs') || null;
    const regularPlaylists = allFbPlaylists.filter(p => p.specialType !== 'liked-songs');

    setLikedSongsPlaylist(likedPlaylist);
    setUserPlaylists(regularPlaylists);

    // This state holds ALL playlists (Firebase + YouTube) for views like Library.
    setPlaylists(prev => [...prev.filter(p => p.source === 'youtube'), ...allFbPlaylists]);
  }, []);

  const fetchSubscriptionHomeFeed = useCallback(async (subs: Subscription[]) => {
    if (subs.length === 0) {
      setSubscriptionHomeFeed([]);
      return;
    }
    try {
      // Fetch videos from the first 5 subscriptions for the home feed
      const feedPromises = subs.slice(0, 5).map(sub => getChannelVideos(sub.channelId));
      const channelVideoResults = await Promise.all(feedPromises);

      // Get the 3 latest videos from each channel and flatten the array
      const feedTracks = channelVideoResults.flatMap(result => result.tracks.slice(0, 3));

      // Shuffle for variety
      feedTracks.sort(() => Math.random() - 0.5);

      setSubscriptionHomeFeed(feedTracks.slice(0, 12)); // Limit to 12 total for the home page
    } catch (error) {
      console.error("Failed to fetch subscription home feed:", error);
      setSubscriptionHomeFeed([]); // Clear on error
    }
  }, []);

  useEffect(() => {
    if (initState !== 'success') return;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      setSessionError(null); // Clear previous errors on auth state change
      if (firebaseUser) {
        try {
          await ensureUserDocument(firebaseUser);
          const userData = await getUserData(firebaseUser.uid);
          const user: User = {
            uid: firebaseUser.uid,
            username: userData?.username || '',
            displayName: userData?.displayName || firebaseUser.displayName || '',
            email: firebaseUser.email,
            photoURL: userData?.photoURL || firebaseUser.photoURL || '',
            youtubeToken: userData?.youtubeToken || null,
            authProvider: firebaseUser.providerData[0].providerId,
          };
          setCurrentUser(user);
          await fetchFirebaseData(firebaseUser.uid);
          if (user.youtubeToken && showYouTubePlaylists) {
            (window as any).gapi.client.setToken(user.youtubeToken);
            await fetchYouTubeData(firebaseUser.uid);
          }
        } catch (error: any) {
          console.error("Error during user session setup:", error);
          if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes('permission'))) {
            setSessionError("Missing or insufficient permissions.");
          } else {
            setSessionError(`An unexpected error occurred: ${error.message}`);
          }
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        setPlaylists([]);
        setUserPlaylists([]);
        setLikedSongsPlaylist(null);
        setSubscriptions([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [initState, fetchFirebaseData, fetchYouTubeData, showYouTubePlaylists]);

  // Effect to handle data fetching/clearing when playlist sync toggle changes
  useEffect(() => {
    if (!currentUser?.youtubeToken) return;

    if (showYouTubePlaylists) {
      fetchYouTubeData(currentUser.uid);
    } else {
      setPlaylists(prev => prev.filter(p => p.source === 'firebase'));
      setSubscriptions([]);
    }
  }, [showYouTubePlaylists, currentUser?.uid, currentUser?.youtubeToken, fetchYouTubeData]);

  // Effect to fetch subscription feed for home page when subscriptions change
  useEffect(() => {
    if (subscriptions.length > 0) {
      fetchSubscriptionHomeFeed(subscriptions);
    } else {
      setSubscriptionHomeFeed([]);
    }
  }, [subscriptions, fetchSubscriptionHomeFeed]);


  const handleConnectYouTube = async () => {
    if (!currentUser) return;
    try {
      const token = await requestYouTubeAccess();
      await saveYouTubeToken(currentUser.uid, token);
      if (showYouTubePlaylists) {
        await fetchYouTubeData(currentUser.uid);
      }
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

  const handleToggleYouTubePlaylists = () => {
    const newValue = !showYouTubePlaylists;
    localStorage.setItem('showYouTubePlaylists', String(newValue));
    setShowYouTubePlaylists(newValue);
  };

  const handleProfileUpdate = async (updates: { username?: string; displayName?: string; photoURL?: string; }) => {
    if (!currentUser) return;
    try {
      await updateUserProfile(updates);
      // Optimistically update local state
      setCurrentUser(prev => prev ? {
        ...prev,
        username: updates.username ?? prev.username,
        displayName: updates.displayName ?? prev.displayName,
        photoURL: updates.photoURL ?? prev.photoURL,
      } : null);
      if (updates.username) {
        navigate(`/${updates.username}`, true);
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const handleAccountDelete = async () => {
    try {
      await deleteUserAccount();
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error("Account deletion failed:", error);
      throw error;
    }
  };


  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleLogout = useCallback(() => {
    setSessionError(null);
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

  const toggleAudioOnly = useCallback(() => {
    setIsAudioOnly(prev => {
      const newState = !prev;
      localStorage.setItem('audioOnly', String(newState));
      return newState;
    });
  }, []);

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    navigate('/library');
    setIsSidebarOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  }
  const handleNavigateToChannel = (channelId: string) => {
    navigate(`/channel/${channelId}`);
    setIsSidebarOpen(false);
  };

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearchHistory(prev => {
      const newHistory = [trimmedQuery, ...prev.filter(item => item !== trimmedQuery)].slice(0, 20);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });

    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleClearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleCreatePlaylist = async (name: string) => {
    if (!currentUser) return;
    try {
      const newPlaylistId = await createFbPlaylist(name, currentUser);
      setCreatePlaylistError(null);
      setCreatePlaylistModalOpen(false);

      if (trackForPlaylist) {
        await addTrackToFbPlaylist(newPlaylistId, trackForPlaylist);
        setTrackForPlaylist(null);
      }

      await fetchFirebaseData(currentUser.uid);
    } catch (error: any) {
      setCreatePlaylistError(error.message);
    }
  };

  const handleLikeToggle = async (track: Track, isLiked: boolean) => {
    if (!currentUser) return;
    try {
      if (isLiked) {
        await unlikeTrack(currentUser.uid, track);
      } else {
        await likeTrack(currentUser, track);
      }
      await fetchFirebaseData(currentUser.uid); // Refetch to update UI state reliably
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Optionally revert optimistic update here
    }
  };

  const handleAddToPlaylist = async (playlistId: string, track: Track) => {
    if (!currentUser) return;
    try {
      await addTrackToFbPlaylist(playlistId, track);
      setTrackForPlaylist(null); // Close modal
      await fetchFirebaseData(currentUser.uid); // Refetch to track counts etc.
    } catch (error) {
      console.error("Failed to add track to playlist:", error);
      // Optionally show an error message to the user
    }
  };

  const handleRemoveFromPlaylist = async (playlistId: string, track: Track) => {
    if (!currentUser) return;
    try {
      await removeTrackFromPlaylist(playlistId, track);
      await fetchFirebaseData(currentUser.uid); // Refetch to update UI
    } catch (error) {
      console.error("Failed to remove track from playlist:", error);
      // Optionally show an error to the user
    }
  };

  const renderView = () => {
    const [path, queryString] = location.split('?');
    const pathSegments = path.split('/').filter(Boolean);
    const mainPath = pathSegments[0];
    const param1 = pathSegments[1];

    // This logic is now only for authenticated users.
    // Auth routes are handled before this.
    switch (mainPath) {
      case 'search':
        return <Search
          locationSearch={queryString ? `?${queryString}` : ''}
          onPlay={playTrack}
          onNavigateToChannel={handleNavigateToChannel}
          searchHistory={searchHistory}
          onSearch={handleSearch}
          onClearHistory={handleClearSearchHistory}
        />;
      case 'library':
        return <Library
          playlists={playlists}
          onPlay={playTrack}
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={setSelectedPlaylistId}
          onNavigateToChannel={handleNavigateToChannel}
          onLikeToggle={handleLikeToggle}
          likedTracks={likedSongsPlaylist?.tracks || []}
          onAddToPlaylist={setTrackForPlaylist}
          onAddToQueue={addToQueue}
          onRemoveFromPlaylist={handleRemoveFromPlaylist}
        />;
      case 'subscriptions':
        return <Subscriptions
          subscriptions={subscriptions}
          onPlay={playTrack}
          onNavigateToChannel={handleNavigateToChannel}
        />;
      case 'channel':
        return <Channel
          channelId={param1!}
          onPlay={playTrack}
          onNavigateToChannel={handleNavigateToChannel}
        />;
      case 'settings':
        return <Settings
          user={currentUser!}
          onConnectYouTube={handleConnectYouTube}
          onDisconnectYouTube={handleDisconnectYouTube}
          onAccountDelete={handleAccountDelete}
          onProfileUpdate={handleProfileUpdate}
          showYouTubePlaylists={showYouTubePlaylists}
          onToggleYouTubePlaylists={handleToggleYouTubePlaylists}
        />;
      case undefined: // Root path /
        return <Home onPlay={playTrack} onNavigateToChannel={handleNavigateToChannel} subscriptions={subscriptions.slice(0, 12)} subscriptionVideos={subscriptionHomeFeed} />;
      default:
        // Assume it's a username for a profile page
        if (mainPath === 'auth') return null; // Should be redirected away
        return <Profile
          username={mainPath}
          currentUser={currentUser}
          onSelectPlaylist={handleSelectPlaylist}
          navigate={navigate}
        />;
    }
  };

  if (initState === 'pending') {
    return <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black">Initializing...</div>;
  }
  if (initState === 'error') {
    return <InitializationError message={initError} />;
  }

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">Loading user...</div>;
  }

  if (sessionError) {
    return <SessionError message={sessionError} onLogout={handleLogout} />;
  }

  const [path] = location.split('?');
  const isAuthRoute = path.startsWith('/auth');

  // Route Guarding
  if (!currentUser) {
    if (isAuthRoute) {
      const view = path.split('/')[2] as 'login' | 'signup' || 'login';
      return <Login
        onGoogleLogin={onLoginWithGoogle}
        onEmailLogin={signInWithEmail}
        onEmailSignUp={signUpWithEmail}
        navigate={navigate}
        initialView={view}
      />;
    } else {
      return <Redirect to="/auth/login" replace={true} navigate={navigate} message="Redirecting to login..." />;
    }
  }

  // User is logged in, but trying to access an auth route
  if (isAuthRoute) {
    return <Redirect to="/" replace={true} navigate={navigate} message="Redirecting..." />;
  }

  // --- User is Authenticated: Render Main App ---
  return (
    <ErrorBoundary>
      <div className={`w-full min-h-screen font-sans text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-black transition-colors duration-300`}>
        <div className="flex h-screen">
          <Sidebar
            location={location}
            onNavigate={handleNavigate}
            playlists={userPlaylists}
            likedSongsPlaylist={likedSongsPlaylist}
            onSelectPlaylist={handleSelectPlaylist}
            selectedPlaylistId={selectedPlaylistId}
            onCreatePlaylist={() => setCreatePlaylistModalOpen(true)}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            subscriptions={subscriptions}
            onNavigateToChannel={handleNavigateToChannel}
          />

          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header
              user={currentUser}
              onLogout={handleLogout}
              toggleTheme={toggleTheme}
              theme={theme}
              onBack={goBack}
              onForward={goForward}
              onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
              navigate={navigate}
              location={location}
            />
            <div className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 ${currentTrack && !isPlayerMaximized ? 'pb-20 md:pb-28' : ''}`}>
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

        <AddToPlaylistModal
          isOpen={!!trackForPlaylist}
          onClose={() => setTrackForPlaylist(null)}
          track={trackForPlaylist}
          playlists={userPlaylists}
          onSelectPlaylist={handleAddToPlaylist}
          onCreateNewPlaylist={() => {
            setCreatePlaylistModalOpen(true);
          }}
        />

        {currentTrack && (
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
            onLikeToggle={handleLikeToggle}
            onOpenAddToPlaylistModal={() => setTrackForPlaylist(currentTrack)}
            likedTracks={likedSongsPlaylist?.tracks || []}
            isAudioOnly={isAudioOnly}
            onToggleAudioOnly={toggleAudioOnly}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}