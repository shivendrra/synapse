import React, { useState, useEffect } from 'react';
import type { Track, Subscription } from '../types';
import { getTrendingMusic, getChannelVideos } from '../services/youtube';
import TrackCard from '../components/TrackCard';

interface HomeProps {
  onPlay: (track: Track, trackList: Track[]) => void;
  onNavigateToChannel: (channelId: string) => void;
  subscriptions: Subscription[];
}

const TrackSection: React.FC<{
    title: string;
    tracks: Track[];
    onPlay: (track: Track, trackList: Track[]) => void;
    onNavigateToChannel: (channelId: string) => void;
}> = ({ title, tracks, onPlay, onNavigateToChannel }) => {
    if (tracks.length === 0) return null;
    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tracks.map(track => (
                    <TrackCard key={track.videoId} track={track} trackList={tracks} onPlay={onPlay} onNavigateToChannel={onNavigateToChannel} />
                ))}
            </div>
        </section>
    );
}

const SubscriptionSection: React.FC<{
    subscriptions: Subscription[];
    onNavigateToChannel: (channelId: string) => void;
}> = ({ subscriptions, onNavigateToChannel }) => {
    if (subscriptions.length === 0) return null;
    return (
        <section className="mb-12">
             <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Subscriptions</h2>
             <div className="flex space-x-4 overflow-x-auto pb-4">
                {subscriptions.map(sub => (
                    <button key={sub.channelId} onClick={() => onNavigateToChannel(sub.channelId)} className="flex flex-col items-center space-y-2 flex-shrink-0 w-28 text-center">
                        <img src={sub.thumbnail} alt={sub.title} className="w-24 h-24 rounded-full" />
                        <p className="text-xs font-semibold truncate w-full">{sub.title}</p>
                    </button>
                ))}
             </div>
        </section>
    );
};


const Home: React.FC<HomeProps> = ({ onPlay, onNavigateToChannel, subscriptions }) => {
  const [trending, setTrending] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const trendingData = await getTrendingMusic();
        setTrending(trendingData);
      } catch (err) {
        console.error(err);
        setError('Failed to load trending music. Please check your YouTube API key.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading content...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <SubscriptionSection subscriptions={subscriptions} onNavigateToChannel={onNavigateToChannel} />
      <TrackSection title="Trending Now" tracks={trending} onPlay={onPlay} onNavigateToChannel={onNavigateToChannel} />
    </div>
  );
};

export default Home;
