import React, { useState, useEffect, useRef } from 'react';
import type { Track } from '../types';

interface PlayerProps {
  track: Track;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAddToQueue: (track: Track) => void;
  onNavigateToChannel: (channelId: string) => void;
  isYtApiReady: boolean;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

const Player: React.FC<PlayerProps> = ({ 
    track, isPlaying, setIsPlaying,
    onTogglePlay, onNext, onPrev, 
    onAddToQueue, onNavigateToChannel,
    isYtApiReady,
    isMaximized, onToggleMaximize
}) => {
  const playerRef = useRef<any>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Swipe to close state
  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);
  const playerRefEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  useEffect(() => {
    if (!isYtApiReady) {
      return;
    }
    
    const onPlayerReady = (event: any) => {
        event.target.setVolume(volume * 100);
        event.target.playVideo();
        setIsPlaying(true);
    };

    const onPlayerStateChange = (event: any) => {
        if (event.data === (window as any).YT.PlayerState.PLAYING) {
            setIsPlaying(true);
        } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
            setIsPlaying(false);
        } else if (event.data === (window as any).YT.PlayerState.ENDED) {
            onNext();
        }
    };
    
    if (!playerRef.current) {
        const player = new (window as any).YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: track.videoId,
            playerVars: {
                autoplay: 1,
                controls: 0,
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            },
        });
        playerRef.current = player;
    } else {
        playerRef.current.loadVideoById(track.videoId);
    }

  }, [isYtApiReady, track.videoId, onNext, setIsPlaying, volume]);
  
  useEffect(() => {
    const interval = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && isPlaying) {
            const time = playerRef.current.getCurrentTime();
            setCurrentTime(time);
            setProgress((time / track.duration) * 100);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, track.duration]);

  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        if(isPlaying) {
            playerRef.current.playVideo();
        } else {
            playerRef.current.pauseVideo();
        }
    }
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if(playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(newVolume * 100);
    }
  };
  
  const handleProgressSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    const newTime = (newProgress / 100) * track.duration;
    setCurrentTime(newTime);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(newTime, true);
    }
  }
  
  // Swipe to close handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
      touchMoveY.current = e.targetTouches[0].clientY;
      const diff = touchMoveY.current - touchStartY.current;
      if (diff > 0 && playerRefEl.current) {
          playerRefEl.current.style.transform = `translateY(${diff}px)`;
      }
  };

  const handleTouchEnd = () => {
      const diff = touchMoveY.current - touchStartY.current;
      if (diff > 100) { // If swiped more than 100px
          onToggleMaximize();
      }
      if (playerRefEl.current) {
          playerRefEl.current.style.transform = ''; // Reset transform
      }
      touchStartY.current = 0;
      touchMoveY.current = 0;
  };

  const PlayerControls = (
    <div className="flex flex-col items-center justify-center w-full">
        <div className="flex items-center space-x-4">
            <button onClick={onPrev} className="p-2 text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-3xl">skip_previous</span></button>
            <button onClick={onTogglePlay} className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform">
            {isPlaying ? <span className="material-symbols-outlined text-3xl">pause</span> : <span className="material-symbols-outlined text-3xl">play_arrow</span>}
            </button>
            <button onClick={onNext} className="p-2 text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-3xl">skip_next</span></button>
        </div>
        <div className="flex items-center w-full max-w-lg mt-2 space-x-2">
            <span className="text-xs text-gray-400 w-10 text-center">{formatTime(currentTime)}</span>
            <input 
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressSeek}
            className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-white"
            />
            <span className="text-xs text-gray-400 w-10 text-center">{formatTime(track.duration)}</span>
        </div>
    </div>
  );

  const TrackInfo = (
    <div className="flex items-center min-w-0">
        <img src={track.thumbnail} alt={track.title} className="w-14 h-14 rounded-md" />
        <div className="ml-3 min-w-0">
            <p className="font-semibold text-sm truncate">{track.title}</p>
            <button onClick={() => onNavigateToChannel(track.channelId)} className="text-xs text-gray-400 hover:text-white hover:underline truncate text-left">
                {track.artist}
            </button>
        </div>
    </div>
  );

  const ActionButtons = (
     <>
        <button onClick={() => onAddToQueue(track)} className="p-2 text-gray-400 hover:text-white" title="Add to Queue">
            <span className="material-symbols-outlined">queue_music</span>
        </button>
        <div className="hidden md:flex items-center w-32">
            <span className="material-symbols-outlined">volume_up</span>
            <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer ml-2 accent-white"
            />
        </div>
     </>
  );

  const MaximizedPlayer = (
    <div className="grid grid-cols-3 items-center h-full">
      <div className="flex items-center justify-start">
        {TrackInfo}
      </div>

      <div className="flex flex-col items-center justify-center">
        {PlayerControls}
      </div>
      
      <div className="flex items-center justify-end space-x-2">
        {ActionButtons}
      </div>
    </div>
  );

  const MiniPlayer = (
    <div className="h-full relative">
        <div className="flex items-center justify-between h-full px-3">
            <div className="flex items-center min-w-0" onClick={onToggleMaximize}>
                <img src={track.thumbnail} alt={track.title} className="w-11 h-11 rounded-md" />
                <div className="ml-3 min-w-0">
                    <p className="font-semibold text-sm truncate">{track.title}</p>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={onTogglePlay} className="p-2">
                    {isPlaying ? <span className="material-symbols-outlined text-3xl">pause</span> : <span className="material-symbols-outlined text-3xl">play_arrow</span>}
                </button>
            </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-600">
            <div className="h-full bg-white" style={{ width: `${progress}%` }}></div>
        </div>
    </div>
  );

  const FullscreenPlayer = (
    <div 
        ref={playerRefEl}
        className="fixed inset-0 bg-gradient-to-b from-gray-800 to-black z-50 flex flex-col p-4 text-white player-fullscreen-enter-active transition-transform duration-200 ease-out"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
        <div className="flex justify-between items-center">
            <button onClick={onToggleMaximize} className="p-2">
                <span className="material-symbols-outlined">expand_more</span>
            </button>
            <span className="text-sm font-bold">Now Playing</span>
            <div className="w-8"></div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center px-4">
            <img src={track.thumbnail.replace('default', 'hqdefault')} alt={track.title} className="w-full max-w-xs aspect-square rounded-lg shadow-2xl mb-8" />
            <div className="w-full text-center">
                <h2 className="text-xl font-bold">{track.title}</h2>
                <button onClick={() => onNavigateToChannel(track.channelId)} className="text-md text-gray-400 hover:underline">
                    {track.artist}
                </button>
            </div>
        </div>
        <div className="pb-8">
            {PlayerControls}
            <div className="flex justify-between items-center mt-4">
                {ActionButtons}
            </div>
        </div>
    </div>
  );

  if (isMobile) {
    if (isMaximized) {
        return FullscreenPlayer;
    }
    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900/90 backdrop-blur-md text-white z-50 border-t border-gray-700">
            {MiniPlayer}
        </div>
    )
  }

  // Desktop player
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gray-900/80 dark:bg-black/80 backdrop-blur-md text-white p-3 z-50 border-t border-gray-700">
      {MaximizedPlayer}
    </div>
  );
};

export default Player;
