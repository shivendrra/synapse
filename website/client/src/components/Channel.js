import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoCard from './VideoCard';

export default function Channel() {
  const { channelId } = useParams();
  const [channelInfo, setChannelInfo] = useState(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        const channelId = 'UCsXVk37bltHxD1rDPwtNM8Q';
        const url = `http://localhost:3001/content/channel?channelId=${channelId}`;
        // const url = `https://synapse-backend.vercel.app/content/channel?channelId=${channelId}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch channel information');
        }
        const data = await response.json();
        setChannelInfo(data.channel);
        setVideos(data.videos);
      } catch (error) {
        console.error('Error fetching channel information:', error);
      }
    };

    fetchChannelInfo();
  }, [channelId]);

  return (
    <div className="channel-page">
      {channelInfo && (
        <div className="row">
          <div className="col-lg-12 channel-header">
            <div className="col-lg-4">
              <img src={channelInfo.thumbnails.default.url} alt={channelInfo.title} />
            </div>
            <div className="col-lg-8">
              <h3 className='channel-title'>{channelInfo.title}</h3>
              <h5 className='channel-id'>{channelId}</h5>
              <p>{channelInfo.description}</p>
            </div>
          </div>
        </div>
      )}
      <div className="col-lg-12 channel-contents">
        {videos.map((video) => (
          <VideoCard key={video.videoId} {...video} />
        ))}
      </div>
    </div>
  );
}