import React, { useState } from 'react';
import VideoCard from './VideoCard';
import { handleError } from '../utils';
import { ToastContainer } from 'react-toastify';
import './styles/SearchResults.css';

export default function SearchResults({ onPlay, videos, setVideos, handleAddToQueue }) {
  const [searchText, setSearchText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const response = await fetch('http://localhost:3001/search', {
      const response = await fetch('https://synapse-backend.vercel.app/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchText }),
      });

      if (!response.ok) {
        throw new Error('Error while fetching videos');
      }
      const data = await response.json();
      setVideos(data);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="search-results-container">
      <div className='vid-sec'>
        <div className="search-section row">
          <form action='POST' onSubmit={handleSubmit}>
            <div className='col-lg-12 search-input-container'>
              <div className="search-bar-wrapper">
                <span className='search-icon'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='currentColor' className='bi bi-search' viewBox='0 0 16 16'>
                    <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0' />
                  </svg>
                </span>
                <input 
                  className='search-input' 
                  name='search' 
                  type='text' 
                  placeholder='Search for songs/videos...' 
                  aria-label='Search' 
                  value={searchText} 
                  onChange={(e) => setSearchText(e.target.value)} 
                />
                <button className='search-submit-btn' type='submit'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='currentColor' className='bi bi-arrow-right' viewBox='0 0 16 16'>
                    <path fillRule='evenodd' d='M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8' />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
        {videos.length > 0 && (
          <div className='video-results'>
            <div className='container'>
              <div className='row'>
                {videos.map((video, index) => (
                  <div key={video.videoId} className='col-lg-12 col-xs-6 video-card-col'>
                    <VideoCard
                      title={video.title}
                      channel={video.channel}
                      imageUrl={video.thumbnailUrl}
                      videoUrl={video.videoId}
                      channelId={video.channelId}
                      handleAddToQueue={handleAddToQueue}
                      onPlay={() => onPlay(video.videoId, video.title, video.channel, video.thumbnailUrl, index, video.channelId)}
                      description={video.description}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}