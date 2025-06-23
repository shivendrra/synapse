import React, { useState, useEffect, useCallback } from 'react';
import DisplayCards from './DisplayCards';
import { handleError } from '../utils';
import Footer from './Footer';
import './styles/Home.css';

export default function Home({ category, onPlay, handleAddToQueue }) {
  const [randomVideos, setRandomVideos] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = () => {
      const token = localStorage.getItem('token');
      setUsername(localStorage.getItem('username'));
      setLoggedInUser(!!token);
    };
    checkUserLoggedIn();
  }, []);

  const fetchRandomVideos = useCallback(async () => {
    try {
      // const url = `http://localhost:3001/content/random-videos?category=${category}`;
      const url = `https://synapse-backend.vercel.app/content/random-videos?category=${category}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error while fetching random videos');
      }
      const results = await response.json();
      setRandomVideos(results);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (loggedInUser) {
      fetchRandomVideos();
    }
  }, [category, loggedInUser, fetchRandomVideos]);

  if (!loggedInUser) {
    return (
      <div className="home-container">
        <div className="login-prompt">
          <div className="login-card">
            <h2 className="login-title">Welcome to Synapse</h2>
            <p className="login-subtitle">Please log in to discover amazing music</p>
            <div className="login-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3V12L8 8M12 3L16 7L12 12M12 3C16.97 3 21 7.03 21 12S16.97 21 12 21 3 16.97 3 12 7.03 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">Loading your music...</p>
        </div>
      ) : (
        <div className="content-wrapper">
          {/* <div className="section-header">
            <h1 className="section-title">Discover Music</h1>
            <p className="section-subtitle">Handpicked tracks just for you</p>
          </div> */}
          
          <div className="videos-grid">
            {randomVideos.length > 0 ? (
              randomVideos.map((video, index) => (
                <div key={video.videoId} className="video-card-wrapper">
                  <DisplayCards
                    title={video.title}
                    channel={video.channel}
                    imageUrl={video.thumbnailUrl}
                    videoUrl={video.videoId}
                    channelId={video.channelId}
                    handleAddToQueue={handleAddToQueue}
                    onPlay={() => onPlay(video.videoId, video.title, video.channel, video.thumbnailUrl, index)}
                    username={username}
                  />
                </div>
              ))
            ) : (
              <div className="no-content">
                <div className="no-content-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21S3 16.97 3 12 7.03 3 12 3 21 7.03 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="no-content-title">No music found</h3>
                <p className="no-content-text">Try selecting a different category</p>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}