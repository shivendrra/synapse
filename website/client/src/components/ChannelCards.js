import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import he from 'he';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import './styles/ChannelCards.css';

export default function ChannelCards(props) {
  const { title, channel, imageUrl, videoUrl, onPlay, handleAddToQueue } = props;
  const [queue, setQueue] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
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

  const handleAddQueue = () => {
    handleAddToQueue(newSong);
    handleSuccess('Added to queue');
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get('https://synapse-backend.vercel.app/download', {
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
    <>
      <div 
        className="channel-card-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="channel-card">
          <div className="card-image-container" onClick={handlePlay}>
            <img src={imageUrl} alt={title} className="card-image" />
            <div className={`play-overlay ${isHovered ? 'show' : ''}`}>
              <div className="play-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card-content">
            <div className="card-main-content" onClick={handlePlay}>
              <h5 className="card-title">{he.decode(title)}</h5>
              <p className="card-channel">{he.decode(channel)}</p>
            </div>
            
            <div className="card-actions">
              <div className="dropdown">
                <button className="options-button" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="6" r="1.5"/>
                    <circle cx="12" cy="18" r="1.5"/>
                  </svg>
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={handlePlay}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Play Now
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleAddQueue}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      Add to Queue
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleDownload}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
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
    </>
  );
}

ChannelCards.propTypes = {
  title: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
  onPlay: PropTypes.func.isRequired,
};