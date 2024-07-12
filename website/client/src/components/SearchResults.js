import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import VideoCard from './VideoCard';
import BottomNav from './BottomNav';

export default function SearchResults() {
  const location = useLocation();
  const { videos, error } = location.state || { videos: [], error: null };
  const [audioUrl, setAudioUrl] = useState(null);
  const [bottomNav, setBottomNav] = useState(false);
  const [audioTitle, setAudioTitle] = useState('');
  const [channelName, setChannelName] = useState('');
  const [imsSrc, setImsSrc] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePlay = (videoUrl, title, channel, imageUrl, index) => {
    setAudioUrl(videoUrl);
    setAudioTitle(title);
    setChannelName(channel);
    setImsSrc(imageUrl);
    setCurrentIndex(index);
    setBottomNav(true);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % videos.length;
    const nextVideo = videos[nextIndex];
    handlePlay(nextVideo.videoId, nextVideo.title, nextVideo.channel, nextVideo.thumbnailUrl, nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    const prevVideo = videos[prevIndex];
    handlePlay(prevVideo.videoId, prevVideo.title, prevVideo.channel, prevVideo.thumbnailUrl, prevIndex);
  };

  return (
    <>
      <div className='vid-sec'>
        {videos.length > 0 && (
          <div className='video-results mt-5'>
            <div className='container mt-5'>
              <div className='row mt-5'>
                {videos.map((video, index) => (
                  <div key={video.videoId} className='col-lg-12 col-xs-6'>
                    <VideoCard
                      title={video.title}
                      channel={video.channel}
                      imageUrl={video.thumbnailUrl}
                      videoUrl={video.videoId}
                      onPlay={() => handlePlay(video.videoId, video.title, video.channel, video.thumbnailUrl, index)}
                      description={video.description}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {error && <p>Error: {error}</p>}
      </div>
      {bottomNav && (
        <BottomNav
          audioUrl={audioUrl}
          audioTitle={audioTitle}
          state={bottomNav}
          channelName={channelName}
          imsSrc={imsSrc}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </>
  );
}