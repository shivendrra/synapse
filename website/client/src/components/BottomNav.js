import React, { useEffect, useRef, useState } from "react";
import he from "he";

export default function BottomNav(props) {
  const { state, audioTitle, audioUrl, channelName, imsSrc, onNext, onPrevious } = props;
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const playerRef = useRef(null);
  const [isRepeating, setIsRepeating] = useState(false);
  const [volume, setVolume] = useState(8);

  useEffect(() => {
    const loadYouTubeIframeAPI = () => {
      if (!window.YT) {
        console.log("Loading YouTube IFrame API script");
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        tag.onload = () => {
          console.log("YouTube IFrame API script loaded");
          createPlayer(audioUrl);
        };
      } else {
        createPlayer(audioUrl);
      }
    };

    const createPlayer = (url) => {
      if (!url) return;
      console.log("Creating YouTube player with videoId:", url);

      playerRef.current = new window.YT.Player("ytplayer", {
        height: "0",
        width: "0",
        videoId: url,
        events: {
          "onReady": (event) => {
            console.log("Player is ready");
            event.target.playVideo();
            setDuration(event.target.getDuration());
            setIsPlaying(true);
            event.target.setVolume(volume * 100);
          },
          "onStateChange": (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              console.log("Video is playing");
              startProgressUpdate(event.target);
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              console.log("Video is paused or ended");
              clearInterval(intervalRef.current);
              setIsPlaying(false);
              if (event.data === window.YT.PlayerState.ENDED && isRepeating) {
                event.target.playVideo();
              }
            }
          },
        },
      });
    };

    if (audioUrl) {
      loadYouTubeIframeAPI();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      clearInterval(intervalRef.current);
    };
  }, [audioUrl, isRepeating, volume]);

  const startProgressUpdate = (target) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentTime(target.getCurrentTime());
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${minutes}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    playerRef.current && playerRef.current.setVolume(newVolume * 100);
  };

  const handleRepeatToggle = () => {
    setIsRepeating(!isRepeating);
  };

  return (
    <>
      <div className={`bottom-nav ${!state && "d-none"} p-1`}>
        <div className="row gx-0">
          <div className="col-lg-4 title-sec">
            <div className="col-lg-4 m-auto">
              <img src={imsSrc} alt="..." className="img-thumbnail" />
            </div>
            <div className="col-lg-8 p-2">
              <h5 className="audio-title" style={{fontSize: 'smaller'}}>{he.decode(audioTitle)}</h5>
              <h6 className="audio-src" style={{fontSize: 'smaller'}}>{he.decode(channelName)}</h6>
            </div>
          </div>
          <div className="col-lg-4 play-center">
            <div className="col-lg-12 text-center m-auto">
              <button onClick={onPrevious} className="btn-play px-2" title="Shuffle">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-shuffle" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5" />
                  <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192" />
                </svg>
              </button>
              <button onClick={onPrevious} className="btn-play px-2" title="Previous Song">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-skip-start-fill" viewBox="0 0 16 16">
                  <path d="M4 4a.5.5 0 0 1 1 0v3.248l6.267-3.636c.54-.313 1.232.066 1.232.696v7.384c0 .63-.692 1.01-1.232.697L5 8.753V12a.5.5 0 0 1-1 0z" />
                </svg>
              </button>
              <button onClick={handlePlayPause} className="btn-play px-2" title="Pause/Play">
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-pause-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-play-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                  </svg>
                )}
              </button>
              <button onClick={onNext} className="btn-play px-2" title="Next Song">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-skip-end-fill" viewBox="0 0 16 16">
                  <path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0z" />
                </svg>
              </button>
              <button onClick={handleRepeatToggle} className="btn-play px-2" title="Repeat">
                {isRepeating ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-repeat" viewBox="0 0 16 16">
                    <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z" />
                  </svg>) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-repeat" viewBox="0 0 16 16">
                    <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="col-lg-12">
              <div className="player-slide">
                <p>{formatTime(currentTime)}</p>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    setCurrentTime(newTime);
                    playerRef.current && playerRef.current.seekTo(newTime);
                  }}
                />
                <p>{formatTime(duration)}</p>
              </div>
              <div id="ytplayer" className="d-none"></div>
            </div>
          </div>
          <div className="col-lg-4 m-auto ps-5">
            <div className="options float-end d-flex align-items-center">
              <button className="option-btn px-3" title="Queue">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-view-list" viewBox="0 0 16 16">
                  <path d="M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2m0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14" />
                </svg>
              </button>
              <button className="option-btn px-3" title="Card List">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-card-list" viewBox="0 0 16 16">
                  <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z" />
                  <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8m0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
                </svg>
              </button>
              <button className="option-btn px-3 d-flex align-items-center" title="Volume">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-volume-up" viewBox="0 0 16 16">
                  <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z" />
                  <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z" />
                  <path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11" />
                </svg>
                <input
                  type="range"
                  className="volume-slider"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}