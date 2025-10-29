
import React, { useState, useEffect } from 'react';
import type { Track } from '../types';
import { getChannelDetails, getChannelVideos } from '../services/youtube';
import TrackCard from '../components/TrackCard';

interface ChannelProps {
  channelId: string;
  onPlay: (track: Track, trackList: Track[]) => void;
  onNavigateToChannel: (channelId: string) => void;
}

interface ChannelDetails {
  title: string;
  description: string;
  thumbnail: string;
  banner: string | null;
  subscriberCount: string;
}

const formatSubscribers = (count: string): string => {
  const num = parseInt(count, 10);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M subscribers`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K subscribers`;
  return `${num} subscribers`;
};

const Channel: React.FC<ChannelProps> = ({ channelId, onPlay, onNavigateToChannel }) => {
  const [details, setDetails] = useState<ChannelDetails | null>(null);
  const [videos, setVideos] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      setLoading(true);
      setError(null);
      setDetails(null);
      setVideos([]);

      try {
        const [channelData, channelVideos] = await Promise.all([
          getChannelDetails(channelId),
          getChannelVideos(channelId),
        ]);

        setDetails({
          title: channelData.snippet.title,
          description: channelData.snippet.description,
          thumbnail: channelData.snippet.thumbnails.high.url,
          banner: channelData.brandingSettings?.image?.bannerExternalUrl || null,
          subscriberCount: formatSubscribers(channelData.statistics.subscriberCount),
        });
        setVideos(channelVideos);

      } catch (err: any) {
        console.error(err);
        setError(`Failed to load channel data. ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [channelId]);

  if (loading) {
    return <div className="text-center p-10">Loading channel...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!details) {
    return <div className="text-center p-10">Channel not found.</div>;
  }

  return (
    <div>
      <div className="relative h-40 md:h-56 lg:h-64 rounded-lg overflow-hidden mb-[-4rem]">
        {details.banner ? (
          <img src={`${details.banner}=w1280`} alt={`${details.title} banner`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900"></div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative px-4 md:px-8 pt-4">
        <div className="flex items-end space-x-4">
          <img src={details.thumbnail} alt={details.title} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-100 dark:border-black" />
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white">{details.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{details.subscriberCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white px-4 md:px-8">Uploads</h2>
        {videos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {videos.map(track => (
              <TrackCard key={track.videoId} track={track} trackList={videos} onPlay={onPlay} onNavigateToChannel={onNavigateToChannel} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 px-4 md:px-8">This channel has no public videos.</p>
        )}
      </div>

    </div>
  );
};

export default Channel;
