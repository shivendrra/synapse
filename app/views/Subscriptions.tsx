import React, { useState, useEffect } from 'react';
import type { Subscription, Track } from '../types';
import { getChannelVideos } from '../services/youtube';
import TrackCard from '../components/TrackCard';

interface SubscriptionsProps {
  subscriptions: Subscription[];
  onPlay: (track: Track, trackList: Track[]) => void;
  onNavigateToChannel: (channelId: string) => void;
}

interface ChannelFeed {
  channelInfo: Subscription;
  videos: Track[];
}

const ChannelFeedSection: React.FC<{
  feed: ChannelFeed;
  onPlay: (track: Track, trackList: Track[]) => void;
  onNavigateToChannel: (channelId: string) => void;
}> = ({ feed, onPlay, onNavigateToChannel }) => {
  if (feed.videos.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center mb-4">
        <img src={feed.channelInfo.thumbnail} alt={feed.channelInfo.title} className="w-10 h-10 rounded-full mr-3" />
        <h2 
          className="text-xl font-bold text-gray-800 dark:text-white hover:underline cursor-pointer"
          onClick={() => onNavigateToChannel(feed.channelInfo.channelId)}
        >
          {feed.channelInfo.title}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {feed.videos.map(track => (
          <TrackCard key={track.videoId} track={track} trackList={feed.videos} onPlay={onPlay} onNavigateToChannel={onNavigateToChannel} />
        ))}
      </div>
    </section>
  );
};

const Subscriptions: React.FC<SubscriptionsProps> = ({ subscriptions, onPlay, onNavigateToChannel }) => {
  const [feeds, setFeeds] = useState<ChannelFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      if (subscriptions.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const feedPromises = subscriptions.map(async (sub) => {
          const videoData = await getChannelVideos(sub.channelId);
          // Only get the latest 6 videos for this view to keep it clean
          return { channelInfo: sub, videos: videoData.tracks.slice(0, 6) };
        });

        const results = await Promise.allSettled(feedPromises);
        
        const successfulFeeds = results
          .filter(result => result.status === 'fulfilled' && result.value.videos.length > 0)
          .map(result => (result as PromiseFulfilledResult<ChannelFeed>).value);
        
        setFeeds(successfulFeeds);
      } catch (err) {
        console.error("Failed to load subscription feeds:", err);
        const message = err instanceof Error ? err.message : "Could not load subscription videos.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, [subscriptions]);

  if (loading) {
    return <div className="text-center p-10">Loading subscriptions...</div>;
  }
  
  if (error) {
    return <div className="text-center p-10 text-red-500" dangerouslySetInnerHTML={{ __html: error }} />;
  }

  if (subscriptions.length === 0) {
    return (
        <div className="text-center text-gray-500 pt-16">
            <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">video_library</span>
            <h2 className="text-xl font-bold">No subscriptions found.</h2>
            <p>Connect your YouTube account in Settings to see your subscriptions here.</p>
        </div>
    );
  }

  if (feeds.length === 0 && !loading) {
    return (
        <div className="text-center text-gray-500 pt-16">
            <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">upcoming</span>
            <h2 className="text-xl font-bold">No new videos from your subscriptions.</h2>
            <p>Check back later for new content!</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
       <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Subscriptions</h1>
      {feeds.map(feed => (
        <ChannelFeedSection key={feed.channelInfo.channelId} feed={feed} onPlay={onPlay} onNavigateToChannel={onNavigateToChannel} />
      ))}
    </div>
  );
};

export default Subscriptions;