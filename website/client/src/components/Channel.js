import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChannelCards from './ChannelCards';
import './styles/Channel.css';

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
      const url = `https://synapse-backend.vercel.app/content/channel?channelId=${channelId}&pageToken=${pageToken}&maxResults=24`;
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
    <div className="channel-container">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading channel...</p>
        </div>
      ) : (
        <div className="channel-page">
          {channelInfo && (
            <div className="channel-header-section">
              <div className="channel-header row">
                <div className="col-lg-2 col-md-3 col-sm-4 channel-avatar-col">
                  <div className="channel-avatar">
                    <img src={channelInfo.thumbnails.default.url} alt={channelInfo.title} className="channel-img" />
                  </div>
                </div>
                <div className="col-lg-10 col-md-9 col-sm-8 channel-info-col">
                  <h1 className="channel-title">{channelInfo.title}</h1>
                  <p className="channel-description">{channelInfo.description}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="channel-content-section">
            <h2 className="section-title">Videos</h2>
            <div className="channel-contents row">
              {videos.map((video, index) => (
                <div className="col-lg-2 col-md-3 col-sm-4 col-6" key={video.videoId}>
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
          </div>

          <nav aria-label="page navigation" className="page-navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${!prevPageToken ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => prevPageToken && fetchChannelInfo(prevPageToken)}
                  disabled={!prevPageToken}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                  </svg>
                  Previous
                </button>
              </li>
              <li className={`page-item ${!nextPageToken ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => nextPageToken && fetchChannelInfo(nextPageToken)}
                  disabled={!nextPageToken}
                >
                  Next
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              </li>
            </ul>
          </nav>

          <footer className="app-footer">
            <div className="footer-content">
              <h2 className="footer-title">Synapse</h2>
              <p className="footer-version">Version 1.1</p>
              <p className="footer-credits">
                Made by <a href="https://shivendrra.vercel.app/" target="_blank" rel="noopener noreferrer" className="maker-link">@shivendrra_</a>
              </p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}