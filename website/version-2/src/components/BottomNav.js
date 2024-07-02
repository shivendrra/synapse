import React, { useEffect, useState } from 'react';

export default function BottomNav(props) {
  const { state, audioTitle, audioUrl, channelName } = props;
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    let newPlayer;

    if (audioUrl) {
      newPlayer = new window.YT.Player('ytplayer', {
        height: '0',
        width: '0',
        videoId: audioUrl,
        events: {
          'onReady': (event) => {
            event.target.playVideo();
            setDuration(event.target.getDuration());
          },
          'onStateChange': (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              const interval = setInterval(() => {
                setCurrentTime(event.target.getCurrentTime());
              }, 1000);
              return () => clearInterval(interval);
            }
          }
        }
      });
      setPlayer(newPlayer);
    }

    return () => {
      if (newPlayer) {
        newPlayer.destroy();
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <>
      <div className={`bottom-nav ${!state && 'd-none'}`}>
        <div className="row">
          <div className="col-lg-12 pt-1">
            <h4>{audioTitle}</h4>
            <h6>{channelName}</h6>
          </div>
        </div>
        <div className="col-lg-12 col-md-6">
          <div className="player-slide">
            <p>{formatTime(currentTime)}</p>
            <input type="range" className="form-range" min="0" max={duration} value={currentTime}
              onChange={(e) => player && player.seekTo(e.target.value)}
            />
            <p>{formatTime(duration)}</p>
          </div>
          <div id="ytplayer"></div>
        </div>
      </div>
    </>
  )
}
