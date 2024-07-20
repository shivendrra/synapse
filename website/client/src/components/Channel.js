import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChannelCards from './ChannelCards';

export default function Channel({ onPlay, handleAddToQueue }) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const channelId = params.get('channelId');
  const [channelInfo, setChannelInfo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState('');
  const [prevPageToken, setPrevPageToken] = useState('');

  const fetchChannelInfo = useCallback(async (pageToken = '') => {
    try {
      if (!channelId) {
        console.error('Channel ID is undefined');
        return;
      }
      const url = `http://localhost:3001/content/channel?channelId=${channelId}&pageToken=${pageToken}&maxResults=24`;
      // const url = `https://synapse-backend.vercel.app/content/channel?channelId=${channelId}&pageToken=${pageToken}&maxResults=24`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch channel information');
      }
      const data = await response.json();
      setChannelInfo(data.channel);
      setVideos(data.videos);
      setNextPageToken(data.nextPageToken);
      setPrevPageToken(data.prevPageToken);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching channel information:', error);
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchChannelInfo();
  }, [fetchChannelInfo]);

  return (
    <>
      {
        loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="channel-page">
            {channelInfo && (
              <div className="row">
                <div className="col-lg-12 channel-header row">
                  <div className="col-lg-1">
                    <img src={channelInfo.thumbnails.default.url} alt={channelInfo.title} className='channel-img' />
                  </div>
                  <div className="col-lg-11">
                    <h3 className='channel-title'>{channelInfo.title}</h3>
                    <p className='channel-des'>{channelInfo.description}</p>
                  </div>
                </div>
              </div>
            )}
            <hr />
            <div className="col-lg-12 channel-contents row">
              {videos.map((video, index) => (
                <div className="col-lg-2 col-sm-6" key={video.videoId}>
                  <ChannelCards
                    title={video.title}
                    channel={video.channel}
                    imageUrl={video.thumbnailUrl}
                    videoUrl={video.videoId}
                    handleAddToQueue={handleAddToQueue}
                    onPlay={() => onPlay(video.videoId, video.title, video.channel, video.thumbnailUrl, index)}
                  />
                </div>
              ))}
            </div>
            <nav aria-label="page navigation" className='page-navigation my-5'>
              <ul class="pagination justify-content-center">
                {prevPageToken ? (
                  <li class="page-item">
                    <p class="page-link" onClick={() => fetchChannelInfo(prevPageToken)} href='/'>Previous</p>
                  </li>) : (
                  <li class="page-item disabled">
                    <p class="page-link" onClick={() => fetchChannelInfo(nextPageToken)} href='/'>Previous</p>
                  </li>
                )}
                {nextPageToken ? (
                  <li class="page-item">
                    <p class="page-link" onClick={() => fetchChannelInfo(nextPageToken)} href='/'>Next</p>
                  </li>) : (
                  <li class="page-item disabled">
                    <p class="page-link" onClick={() => fetchChannelInfo(nextPageToken)} href='/'>Next</p>
                  </li>
                )}
              </ul>
              <div className="col-lg-6 m-auto text-center">
                <br />
                <hr />
                <br />
                <h2 className='footer-title'>Synapse</h2>
                <h6 className='blockquote-footer pt-3'>Version 1.1</h6>

                <br />
                <h5 style={{ fontSize: 'smaller' }}>made by: <span className='maker-url'><a href='https://shivendrra.vercel.app/' target='blank'>@shivendrra_</a></span></h5>
              </div>
            </nav>
          </div>
        )
      }
    </>
  );
}