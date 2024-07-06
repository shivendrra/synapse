import React, { useEffect, useRef, useState } from "react";
import he from "he";

export default function BottomNav(props) {
  const { state, audioTitle, audioUrl, channelName } = props;
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const playerRef = useRef(null);

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
  }, [audioUrl]);

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

  return (
    <>
      <div className={`bottom-nav ${!state && "d-none"}`}>
        <div className="row">
          <div className="col-lg-12 pt-1 d-flex justify-content-between">
            <div className="col-lg-10 float-start">
              <h5 className="audio-title">{he.decode(audioTitle)}</h5>
              <h6 className="audio-src">{he.decode(channelName)}</h6>
            </div>
            <div className="col-lg-2">
              <button onClick={handlePlayPause} className="btn-play float-end">
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-pause" viewBox="0 0 16 16">
                    <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-play-fill" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="col-lg-12 col-md-6">
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
    </>
  );
}