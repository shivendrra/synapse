import React, { useState, useEffect, useRef } from 'react';
import type { Track } from '../types';
import Visualizer from './Visualizer';

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
  onLikeToggle: (track: Track, isLiked: boolean) => void;
  onOpenAddToPlaylistModal: (track: Track) => void;
  likedTracks: Track[];
  isAudioOnly: boolean;
  onToggleAudioOnly: () => void;
}

const Player: React.FC<PlayerProps> = ({ 
    track, isPlaying, setIsPlaying,
    onTogglePlay, onNext, onPrev, 
    onAddToQueue, onNavigateToChannel,
    isYtApiReady,
    isMaximized, onToggleMaximize,
    onLikeToggle, onOpenAddToPlaylistModal, likedTracks,
    isAudioOnly, onToggleAudioOnly
}) => {
  const playerRef = useRef<any>(null); // YT Player instance
  const playerContainerRef = useRef<HTMLDivElement>(null); // The div that will contain the iframe
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const isLiked = likedTracks.some(t => t.videoId === track.videoId);

  // Mobile UI related refs
  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);
  const playerElRef = useRef<HTMLDivElement>(null);
  const videoPlaceholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // --- PLAYER LIFECYCLE AND CONTROL EFFECTS ---

  // 1. Player Creation & Destruction
  useEffect(() => {
    if (!isYtApiReady || !playerContainerRef.current) return;

    // To prevent React's "removeChild" error, we let the YouTube API
    // replace a child element that we manually create, instead of the ref container itself.
    const playerHostDiv = document.createElement('div');
    playerContainerRef.current.appendChild(playerHostDiv);


    const onPlayerReady = (event: any) => {
        event.target.setVolume(volume * 100);
        event.target.playVideo();
    };

    const onPlayerStateChange = (event: any) => {
        const state = event.data;
        if (state === (window as any).YT.PlayerState.PLAYING) {
            setIsPlaying(true);
        } else if (state === (window as any).YT.PlayerState.PAUSED) {
            setIsPlaying(false);
        } else if (state === (window as any).YT.PlayerState.ENDED) {
            onNext();
        }
    };
    
    const player = new (window as any).YT.Player(playerHostDiv, {
        videoId: track.videoId,
        playerVars: { autoplay: 1, controls: 0, origin: window.location.origin },
        events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange },
    });
    playerRef.current = player;

    return () => {
        if (player && typeof player.destroy === 'function') {
            player.destroy();
        }
        playerRef.current = null;
        if (playerContainerRef.current) {
            // Clean up container manually to be safe
            playerContainerRef.current.innerHTML = '';
        }
    };
  }, [isYtApiReady, track.videoId, volume, setIsPlaying, onNext]);

  // 2. Play/Pause Control
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        if(isPlaying) playerRef.current.playVideo();
        else playerRef.current.pauseVideo();
    }
  }, [isPlaying]);
  
  // 3. Volume Control
  useEffect(() => {
    if (playerRef.current?.setVolume) {
        playerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // 4. Audio-Only Quality Control
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setPlaybackQuality === 'function' && isPlaying) {
        const quality = isAudioOnly ? 'small' : 'default';
        playerRef.current.setPlaybackQuality(quality);
    }
  }, [isAudioOnly, isPlaying]);

  // 5. Progress Bar Update
  useEffect(() => {
    const interval = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && isPlaying) {
            const time = playerRef.current.getCurrentTime();
            if (time !== null) {
              setCurrentTime(time);
              setProgress(track.duration > 0 ? (time / track.duration) * 100 : 0);
            }
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, track.duration]);

  // 6. Video Visibility for Mobile Fullscreen
  useEffect(() => {
    const playerWrapper = playerContainerRef.current;
    if (!playerWrapper) return;

    const updatePosition = () => {
        const showVideo = !isAudioOnly && isMaximized && isMobile;

        if (showVideo && videoPlaceholderRef.current) {
            const rect = videoPlaceholderRef.current.getBoundingClientRect();
            Object.assign(playerWrapper.style, {
                position: 'fixed', top: `${rect.top}px`, left: `${rect.left}px`,
                width: `${rect.width}px`, height: `${rect.height}px`,
                opacity: '1', visibility: 'visible', pointerEvents: 'auto', zIndex: '60',
            });
            const iframe = playerWrapper.querySelector('iframe');
            if (iframe) Object.assign(iframe.style, { width: '100%', height: '100%' });
        } else {
            // Hide it off-screen
             Object.assign(playerWrapper.style, {
                position: 'absolute', top: '-9999px', left: '-9999px',
                width: '1px', height: '1px',
                opacity: '0', visibility: 'hidden', pointerEvents: 'none',
            });
        }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => window.removeEventListener('resize', updatePosition);
  }, [isAudioOnly, isMaximized, isMobile]);


  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };
  
  const handleProgressSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * track.duration;
    setProgress(newProgress);
    setCurrentTime(newTime);
    if (playerRef.current?.seekTo) playerRef.current.seekTo(newTime, true);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.targetTouches[0].clientY; };
  const handleTouchMove = (e: React.TouchEvent) => {
      touchMoveY.current = e.targetTouches[0].clientY;
      const diff = touchMoveY.current - touchStartY.current;
      if (diff > 0 && playerElRef.current) playerElRef.current.style.transform = `translateY(${diff}px)`;
  };
  const handleTouchEnd = () => {
      if (touchMoveY.current - touchStartY.current > 100) onToggleMaximize();
      if (playerElRef.current) playerElRef.current.style.transform = '';
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
            <input type="range" min="0" max="100" value={progress} onChange={handleProgressSeek} className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-brand-500" />
            <span className="text-xs text-gray-400 w-10 text-center">{formatTime(track.duration)}</span>
        </div>
    </div>
  );

  const TrackInfo = (
    <div className="flex items-center min-w-0">
        <img src={track.thumbnail} alt={track.title} className="w-14 h-14 rounded-md" />
        <div className="ml-3 min-w-0">
            <p className="font-semibold text-sm truncate">{track.title}</p>
            <button onClick={() => onNavigateToChannel(track.channelId)} className="text-xs text-gray-400 hover:text-white hover:underline truncate text-left">{track.artist}</button>
        </div>
    </div>
  );

  const ActionButtons = (
     <>
        <button onClick={() => onLikeToggle(track, isLiked)} className="p-2 text-gray-400 hover:text-white" title={isLiked ? "Unlike" : "Like"}><span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isLiked ? 1 : 0}` }}>favorite</span></button>
        <button onClick={() => onOpenAddToPlaylistModal(track)} className="p-2 text-gray-400 hover:text-white" title="Add to playlist"><span className="material-symbols-outlined">playlist_add</span></button>
        <button onClick={onToggleAudioOnly} className="p-2 text-gray-400 hover:text-white" title={isAudioOnly ? "Switch to Video Mode" : "Switch to Audio-Only"}><span className="material-symbols-outlined">{isAudioOnly ? 'music_note' : 'smart_display'}</span></button>
        <button onClick={() => onAddToQueue(track)} className="p-2 text-gray-400 hover:text-white" title="Add to Queue"><span className="material-symbols-outlined">queue_music</span></button>
        <div className="hidden md:flex items-center w-32">
            <span className="material-symbols-outlined">volume_up</span>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer ml-2 accent-brand-500"/>
        </div>
     </>
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
                <button onClick={() => onLikeToggle(track, isLiked)} className="p-2"><span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isLiked ? 1 : 0}` }}>favorite</span></button>
                <button onClick={onTogglePlay} className="p-2">{isPlaying ? <span className="material-symbols-outlined text-3xl">pause</span> : <span className="material-symbols-outlined text-3xl">play_arrow</span>}</button>
            </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-600"><div className="h-full bg-white" style={{ width: `${progress}%` }}></div></div>
    </div>
  );

  const FullscreenPlayer = (
    <div 
        ref={playerElRef}
        className="fixed inset-0 bg-gradient-to-b from-gray-800 to-black z-50 flex flex-col p-4 text-white player-fullscreen-enter-active transition-transform duration-200 ease-out overflow-hidden"
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
        <div className="absolute inset-0 opacity-20 blur-lg scale-110"><img src={track.thumbnail.replace('default', 'hqdefault')} alt="" className="w-full h-full object-cover" /></div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 flex items-center justify-center opacity-30"><Visualizer isPlaying={isPlaying} /></div>

        <div className="relative z-10 flex justify-between items-center">
            <button onClick={onToggleMaximize} className="p-2"><span className="material-symbols-outlined">expand_more</span></button>
            <span className="text-sm font-bold">Now Playing</span>
            <div className="w-8"></div>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4">
            <div ref={videoPlaceholderRef} className="w-full max-w-md aspect-video rounded-lg shadow-2xl mb-8 overflow-hidden bg-black flex items-center justify-center">
              {isAudioOnly && (
                <img src={track.thumbnail.replace('default', 'hqdefault')} alt={track.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="w-full text-center">
                <h2 className="text-xl font-bold">{track.title}</h2>
                <button onClick={() => onNavigateToChannel(track.channelId)} className="text-md text-gray-400 hover:underline">{track.artist}</button>
            </div>
        </div>
        <div className="relative z-10 pb-8">
            {PlayerControls}
             <div className="flex justify-around items-center mt-4">
                <button onClick={() => onLikeToggle(track, isLiked)} className="p-2 text-gray-400 hover:text-white" title={isLiked ? "Unlike" : "Like"}><span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: `'FILL' ${isLiked ? 1 : 0}` }}>favorite</span></button>
                <button onClick={onToggleAudioOnly} className="p-2 text-gray-400 hover:text-white" title={isAudioOnly ? "Switch to Video Mode" : "Switch to Audio-Only"}><span className="material-symbols-outlined text-3xl">{isAudioOnly ? 'music_note' : 'smart_display'}</span></button>
                <button onClick={() => onOpenAddToPlaylistModal(track)} className="p-2 text-gray-400 hover:text-white" title="Add to playlist"><span className="material-symbols-outlined text-3xl">playlist_add</span></button>
                <button onClick={() => onAddToQueue(track)} className="p-2 text-gray-400 hover:text-white" title="Add to Queue"><span className="material-symbols-outlined text-3xl">queue_music</span></button>
            </div>
        </div>
    </div>
  );
  
  const playerUi = () => {
    if (isMobile) {
      return isMaximized ? FullscreenPlayer : (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900/90 backdrop-blur-md text-white z-50 border-t border-gray-700">
          {MiniPlayer}
        </div>
      );
    }
    // Desktop player
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gray-900/80 dark:bg-black/80 backdrop-blur-md text-white z-50 border-t border-gray-700">
        <div className="h-full grid grid-cols-3 items-center px-4">
          <div className="flex items-center justify-start min-w-0 gap-4">{TrackInfo}<div className="w-20 h-10"><Visualizer isPlaying={isPlaying} /></div></div>
          <div className="flex items-center justify-center">{PlayerControls}</div>
          <div className="flex items-center justify-end space-x-2">{ActionButtons}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={playerContainerRef} />
      {playerUi()}
    </>
  );
};

export default Player;