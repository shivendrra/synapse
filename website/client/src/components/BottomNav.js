import React, { useEffect, useRef, useState } from 'react';
import he from 'he';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import './styles/BottomNav.css';

export default function BottomNav(props) {
  const { state, audioTitle, audioUrl, channelName, imsSrc, onNext, onPrevious, setEnded } = props;
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const playerRef = useRef(null);
  const [isRepeating, setIsRepeating] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [dominantColor, setDominantColor] = useState('#1a1a1a');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const canvasRef = useRef(null);

  // Extract dominant color from thumbnail
  const extractDominantColor = (imageSrc) => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let r = 0, g = 0, b = 0;
      let pixelCount = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        pixelCount++;
      }

      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);

      // Darken the color for better contrast
      r = Math.floor(r * 0.3);
      g = Math.floor(g * 0.3);
      b = Math.floor(b * 0.3);

      setDominantColor(`rgb(${r}, ${g}, ${b})`);
    };
    img.src = imageSrc;
  };

  useEffect(() => {
    if (imsSrc) {
      extractDominantColor(imsSrc);
    }
  }, [imsSrc]);

  useEffect(() => {
    const loadYouTubeIframeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        tag.onload = () => {
          createPlayer(audioUrl);
        };
      } else {
        createPlayer(audioUrl);
      }
    };

    const createPlayer = (url) => {
      if (!url) return;

      // Clean up existing player
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
        setIsPlayerReady(false);
      }

      playerRef.current = new window.YT.Player('ytplayer', {
        height: '0',
        width: '0',
        videoId: url,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
        },
      });
    };

    const onPlayerReady = (event) => {
      setIsPlayerReady(true);
      event.target.playVideo();
      setDuration(event.target.getDuration());
      setIsPlaying(true);
      // Set initial volume
      if (event.target.setVolume) {
        event.target.setVolume(volume);
      }
    };

    const onPlayerStateChange = (event) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        startProgressUpdate(event.target);
        setIsPlaying(true);
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
      } else if (event.data === window.YT.PlayerState.ENDED) {
        setEnded(true);
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        if (isRepeating) {
          event.target.playVideo();
        }
      }
    };

    if (audioUrl) {
      loadYouTubeIframeAPI();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
        setIsPlayerReady(false);
      }
      clearInterval(intervalRef.current);
    };
  }, [audioUrl, isRepeating, setEnded, volume]);

  const startProgressUpdate = (target) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (target && target.getCurrentTime) {
        setCurrentTime(target.getCurrentTime());
      }
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handlePlayPause = () => {
    if (playerRef.current && isPlayerReady) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleRepeatToggle = () => {
    setIsRepeating(!isRepeating);
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      if (playerRef.current && isPlayerReady && playerRef.current.setVolume) {
        playerRef.current.setVolume(volume);
      }
      document.documentElement.style.setProperty('--volume-width', `${volume}%`);
    } else {
      setIsMuted(true);
      if (playerRef.current && isPlayerReady && playerRef.current.setVolume) {
        playerRef.current.setVolume(0);
      }
      document.documentElement.style.setProperty('--volume-width', '0%');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get('https://synapse-backend.vercel.app/download', {
        params: { id: audioUrl },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      handleSuccess("Audio downloading....");
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${audioTitle}.mp3`);
      document.body.appendChild(link);
      link.click();
      handleSuccess("Audio downloaded");
    } catch (error) {
      handleError("Error while downloading the audio", error);
      console.error('Error downloading the audio', error);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div
        className={`bottom-nav-container ${!state && 'd-none'}`}
        style={{
          background: `linear-gradient(135deg, ${dominantColor}aa, ${dominantColor}66, #0a0a0a88)`,
        }}
      >
        <div className="bottom-nav-content">
          {/* Track Info Section */}
          <div className="track-info-section">
            <div className="track-thumbnail">
              <img src={imsSrc} alt="Track thumbnail" className="thumbnail-image" />
            </div>
            <div className="track-details">
              <h5 className="track-title">{he.decode(audioTitle)}</h5>
              <h6 className="track-artist">{he.decode(channelName)}</h6>
            </div>
          </div>

          {/* Player Controls Section */}
          <div className="player-controls-section">
            <div className="control-buttons">
              <button onClick={onPrevious} className="control-btn shuffle-btn" title="Shuffle">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5" />
                  <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192" />
                </svg>
              </button>

              <button onClick={onPrevious} className="control-btn" title="Previous">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 4a.5.5 0 0 1 1 0v3.248l6.267-3.636c.54-.313 1.232.066 1.232.696v7.384c0 .63-.692 1.01-1.232.697L5 8.753V12a.5.5 0 0 1-1 0z" />
                </svg>
              </button>

              <button onClick={handlePlayPause} className="control-btn play-pause-btn" title="Play/Pause">
                {isPlaying ? (
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5" />
                  </svg>
                ) : (
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M6.271 5.055a.5.5 0 0 1 .52.038L11 7.055a.5.5 0 0 1 0 .89L6.791 9.907a.5.5 0 0 1-.791-.389V5.482a.5.5 0 0 1 .271-.427" />
                  </svg>
                )}
              </button>

              <button onClick={onNext} className="control-btn" title="Next">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0z" />
                </svg>
              </button>

              <button
                onClick={handleRepeatToggle}
                className={`control-btn repeat-btn ${isRepeating ? 'active' : ''}`}
                title="Repeat"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z" />
                </svg>
              </button>
            </div>

            <div className="progress-section">
              <span className="time-display">{formatTime(currentTime)}</span>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                  <input
                    type="range"
                    className="progress-input"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setCurrentTime(newTime);
                      if (playerRef.current && isPlayerReady && playerRef.current.seekTo) {
                        playerRef.current.seekTo(newTime);
                      }
                    }}
                  />
                </div>
              </div>
              <span className="time-display">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Options Section */}
          <div className="options-section">
            <button className="option-btn" title="Queue" disabled>
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z" />
                <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8m0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
              </svg>
            </button>

            <button className="option-btn" onClick={handleDownload} title="Download">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
              </svg>
            </button>

            <div className="volume-control">
              <button className="option-btn volume-btn" onClick={handleVolumeToggle} title="Volume">
                {isMuted || volume === 0 ? (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06M9.706 5.294a.5.5 0 1 0-.708.708L10.293 7.5 9 8.794a.5.5 0 1 0 .708.708L11.207 8l1.293 1.293a.5.5 0 0 0 .707-.708L11.707 7.5l1.5-1.5a.5.5 0 0 0-.707-.708L11.207 6.5z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z" />
                    <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z" />
                    <path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11" />
                  </svg>
                )}
              </button>
              <div className="volume-slider-container">
                <input
                  type="range"
                  className="volume-slider"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVol = parseInt(e.target.value);
                    setVolume(newVol);
                    setIsMuted(newVol === 0);
                    
                    // Only call setVolume if player is ready and method exists
                    if (playerRef.current && isPlayerReady && playerRef.current.setVolume) {
                      playerRef.current.setVolume(newVol);
                    }
                    
                    // Update visual progress
                    document.documentElement.style.setProperty('--volume-width', `${newVol}%`);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div id="ytplayer" className="d-none"></div>
      </div>
      <ToastContainer />
    </>
  );
}