import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { getChannelDetails } from '../services/youtube';

interface ProfileProps {
  user: User;
  onConnectYouTube: () => void;
  onDisconnectYouTube: () => void;
}

interface ChannelDetails {
  title: string;
  description: string;
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

const Profile: React.FC<ProfileProps> = ({ user, onConnectYouTube, onDisconnectYouTube }) => {
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
            description: channelData.snippet.description,
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
      <>
        <div className="relative h-40 md:h-56 lg:h-64 rounded-lg overflow-hidden mb-[-4rem]">
          {details.banner ? (
              <img src={`${details.banner}=w1280`} alt={`${details.title} banner`} className="w-full h-full object-cover" />
          ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900"></div>
          )}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative px-4 md:px-8 pt-4">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
              <img src={details.thumbnail} alt={details.title} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-100 dark:border-black" />
              <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-white">{details.title}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your Connected YouTube Profile</p>
              </div>
              <button 
                onClick={onDisconnectYouTube} 
                className="px-4 py-2 text-xs font-semibold text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
              >
                  Disconnect
              </button>
          </div>
        </div>
        
        <div className="mt-8 px-4 md:px-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Channel Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-200 dark:bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Subscribers</p>
                  <p className="text-2xl font-bold">{details.subscriberCount}</p>
              </div>
              <div className="bg-gray-200 dark:bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Uploads</p>
                  <p className="text-2xl font-bold">{details.videoCount}</p>
              </div>
              <div className="bg-gray-200 dark:bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
                  <p className="text-2xl font-bold">{details.viewCount}</p>
              </div>
          </div>
          
          <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">About</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{details.description || "No description provided."}</p>
          </div>
        </div>
      </>
    );
  };
  
  return (
    <div className="space-y-8">
        <div className="flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-800">
            <img src={user.photoURL} alt={user.name} className="w-16 h-16 rounded-full" />
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{user.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
        </div>
        {user.youtubeToken ? <ConnectedView /> : <NotConnectedView />}
    </div>
  );
};

export default Profile;