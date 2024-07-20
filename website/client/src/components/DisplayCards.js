import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import he from 'he';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import axios from 'axios';

export default function DisplayCards(props) {
  const { title, channel, imageUrl, videoUrl, onPlay, channelId, handleAddToQueue } = props;
  const [queue, setQueue] = useState([]);
  const audioRef = useRef(null);

  const newSong = {
    videoId: videoUrl,
    title,
    channel,
    thumbnailUrl: imageUrl,
  };

  const handlePlay = useCallback((song) => {
    if (onPlay) {
      onPlay(song.videoId, song.title, song.channel);
    }
  }, [onPlay]);

  const handleAddQueue = () => {
    handleAddToQueue(newSong);
    console.log('Added to queue');
  };

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
      <div className='display-cards p-0 mt-5'>
        <div className='card' style={{ cursor: 'pointer' }}>
          <img src={imageUrl} alt={title} className='card-img-top' onClick={() => handlePlay(newSong)} />
          <div className='card-body px-2 d-flex'>
            <div className='col-lg-11' onClick={() => handlePlay(newSong)}>
              <h5 className='card-title video-title' style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{he.decode(title)}</h5>
              <p className='card-text'>
                <Link to={`/channel?channelId=${channelId}`} className='channel-link'>{he.decode(channel)}</Link>
              </p>
            </div>
            <div className='col-lg-1'>
              <div className="dropdown">
                <button className="option-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='currentColor' className='bi bi-three-dots-vertical' viewBox='0 0 16 16'>
                    <path d='M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0' />
                  </svg>
                </button>
                <ul className='dropdown-menu'>
                  <li>
                    <button className='dropdown-item' onClick={() => handlePlay(newSong)}>
                      Play Now
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item' onClick={handleAddQueue}>
                      Add to Queue
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item' onClick={handleDownload}>
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

DisplayCards.propTypes = {
  title: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
  onPlay: PropTypes.func.isRequired,
  channelId: PropTypes.string.isRequired,
  handleAddToQueue: PropTypes.func.isRequired,
};