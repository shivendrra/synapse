import React, { useState, useEffect } from 'react';
import type { User, Playlist } from '../../types';
import { getChannelDetails } from '../../services/youtube';

interface ProfileOverviewProps {
  user: User;
  onConnectYouTube: () => void;
  onDisconnectYouTube: () => void;
  playlists: Playlist[];
  onSelectPlaylist: (playlistId: string) => void;
}

interface ChannelDetails {
  title: string;
  thumbnail: string;
  banner: string | null;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

const formatNumber = (count: string): string => {
  if (!count) return '0';
  return parseInt(count, 10).toLocaleString();
};

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user, onConnectYouTube, onDisconnectYouTube, playlists, onSelectPlaylist }) => {
  const [details, setDetails] = useState<ChannelDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!user.channelId) {
        setDetails(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const channelData = await getChannelDetails(user.channelId);
        setDetails({
            title: channelData.snippet.title,
            thumbnail: channelData.snippet.thumbnails.high.url,
            banner: channelData.brandingSettings?.image?.bannerExternalUrl || null,
            subscriberCount: formatNumber(channelData.statistics.subscriberCount),
            videoCount: formatNumber(channelData.statistics.videoCount),
            viewCount: formatNumber(channelData.statistics.viewCount),
        });
      } catch (err: any) {
        console.error(err);
        setError(`Failed to load YouTube profile data. ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchChannelData();
  }, [user.channelId]);

  const NotConnectedView = () => (
    <div className="text-center p-10 bg-gray-200 dark:bg-gray-900/50 rounded-lg">
      <span className="material-symbols-outlined text-6xl text-brand-500 mb-4">link</span>
      <h2 className="text-xl font-bold mb-2">Connect your YouTube Account</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Get access to your personal playlists, subscriptions, and more by connecting your YouTube account.
      </p>
      <button 
        onClick={onConnectYouTube}
        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
      >
        <svg className="w-6 h-6 mr-2" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
        </svg>
        Connect with YouTube
      </button>
    </div>
  );

  const ConnectedView = () => {
    if (loading) return <div className="text-center p-10">Loading YouTube profile...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!details) return <div className="text-center p-10">Could not load YouTube profile information.</div>;
    
    return (
      <div className="bg-gray-200 dark:bg-gray-900/50 p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img src={details.thumbnail} alt={details.title} className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-black" />
            <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{details.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your Connected YouTube Profile</p>
            </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Subscribers</p>
                <p className="text-2xl font-bold">{details.subscriberCount}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Uploads</p>
                <p className="text-2xl font-bold">{details.videoCount}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold">{details.viewCount}</p>
            </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Your Playlists</h2>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.map(playlist => (
              <button 
                key={playlist.id} 
                onClick={() => onSelectPlaylist(playlist.id)}
                className="p-4 rounded-lg text-left bg-gray-200 dark:bg-gray-900/50 hover:bg-gray-300 dark:hover:bg-gray-800 transition-all duration-200 transform hover:-translate-y-1"
              >
                  <h3 className="font-bold truncate">{playlist.name}</h3>
                  <p className="text-sm opacity-80">{playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">You haven't created any playlists yet.</p>
        )}
      </div>
      <div>
         <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Connected YouTube Channel</h2>
         {user.youtubeToken ? <ConnectedView /> : <NotConnectedView />}
      </div>
    </div>
  );
};

export default ProfileOverview;