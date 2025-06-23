import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import he from 'he';
import { handleSuccess, handleError } from '../utils';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import './styles/VideoCard.css';

export default function VideoCard(props) {
  const { title, channel, imageUrl, videoUrl, onPlay, channelId, description, handleAddToQueue } = props;
  const [queue, setQueue] = useState([]);
  const audioRef = useRef(null);

  const newSong = {
    videoId: videoUrl,
    title,
    channel,
    thumbnailUrl: imageUrl,
  };

  const handlePlay = useCallback(() => {
    if (onPlay) {
      onPlay(videoUrl, title, channel);
    }
  }, [onPlay, videoUrl, title, channel]);

  const handleDownload = async () => {
    try {
      const response = await axios.get('https://synapse-backend.vercel.app/download', {
      // const response = await axios.get('http://localhost:3001/download', {
        params: { id: videoUrl },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      handleSuccess("Audio downloading....");
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.mp3`);
      document.body.appendChild(link);
      link.click();
      handleSuccess("Audio downloaded");
    } catch (error) {
      handleError("Error while downloading the audio", error);
      console.error('Error downloading the video', error);
    }
  };

  const handleAddQueue = () => {
    handleAddToQueue(newSong);
    console.log('Added to queue');
  };

  const playNextSong = useCallback(() => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(queue.slice(1));
      handlePlay(nextSong);
    }
  }, [queue, handlePlay]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('ended', playNextSong);
      return () => {
        audioElement.removeEventListener('ended', playNextSong);
      };
    }
  }, [playNextSong]);

  return (
    <div className='video-card-wrapper'>
      <div className='video-card'>
        <div className='video-card-inner'>
          <div className='video-thumbnail-container' onClick={handlePlay}>
            <img src={imageUrl} className='video-thumbnail' alt={he.decode(title)} />
            <div className="play-overlay">
              <div className="play-icon">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                </svg>
              </div>
            </div>
          </div>
          <div className='video-content'>
            <div className="video-info">
              <h5 className='video-title' onClick={handlePlay}>
                {he.decode(title)}
              </h5>
              <p className='video-channel'>
                <Link to={`/channel?channelId=${channelId}`} className='channel-link'>
                  {he.decode(channel)}
                </Link>
              </p>
              <p className='video-description'>
                <small>{he.decode(description)}</small>
              </p>
            </div>
            <div className="video-actions">
              <div className="dropdown">
                <button className="options-btn dropdown-toggle" 
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        aria-label="More options">
                  <svg xmlns='http://www.w3.org/2000/svg' 
                       width='20' 
                       height='20' 
                       fill='currentColor' 
                       className='bi bi-three-dots-vertical' 
                       viewBox='0 0 16 16'>
                    <path d='M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0' />
                  </svg>
                </button>
                <ul className='dropdown-menu custom-dropdown'>
                  <li>
                    <button className='dropdown-item' onClick={() => handlePlay(newSong)}>
                      <svg xmlns="http://www.w3.org/2000/svg" 
                           width="16" 
                           height="16" 
                           fill="currentColor" 
                           className="dropdown-icon" 
                           viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                      </svg>
                      Play Now
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item' onClick={handleAddQueue}>
                      <svg xmlns="http://www.w3.org/2000/svg" 
                           width="16" 
                           height="16" 
                           fill="currentColor" 
                           className="dropdown-icon" 
                           viewBox="0 0 16 16">
                        <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0"/>
                      </svg>
                      Add to Queue
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item' onClick={handleDownload}>
                      <svg xmlns="http://www.w3.org/2000/svg" 
                           width="16" 
                           height="16" 
                           fill="currentColor" 
                           className="dropdown-icon" 
                           viewBox="0 0 16 16">
                        <path d="M8.5 6.5V1h-1v5.5L6 5h1L8 6l1-1h1zM14 14V9h-1v4H3V9H2v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1"/>
                      </svg>
                      Download
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

VideoCard.propTypes = {
  title: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onPlay: PropTypes.func.isRequired,
  channelId: PropTypes.string,
  handleAddToQueue: PropTypes.func,
};