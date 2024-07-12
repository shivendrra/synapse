import React, { useState } from 'react';
import VideoCard from './VideoCard';
import BottomNav from './BottomNav';
import { handleError } from '../utils';
import { ToastContainer } from 'react-toastify';

export default function SearchResults() {
  const [videos, setVideos] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [bottomNav, setBottomNav] = useState(false);
  const [audioTitle, setAudioTitle] = useState('');
  const [channelName, setChannelName] = useState('');
  const [imsSrc, setImsSrc] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchText, setSearchText] = useState('');

  const handlePlay = (videoUrl, title, channel, imageUrl, index) => {
    setAudioUrl(videoUrl);
    setAudioTitle(title);
    setChannelName(channel);
    setImsSrc(imageUrl);
    setCurrentIndex(index);
    setBottomNav(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const response = await fetch('http://localhost:3001/search', {
      const response = await fetch('https://synapse-backend.vercel.app/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchText }),
      });

      if (!response.ok) {
        throw new Error('Error while fetching videos');
      }
      const data = await response.json();
      setVideos(data);
    } catch (err) {
      handleError(err);
    }
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
        <div className="search-bar">
          <form action='POST' onSubmit={handleSubmit}>
            <div className='input-group search-bar'>
              <span className='input-group-text' id='basic-addon1'>
                <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='currentColor' className='bi bi-search' viewBox='0 0 16 16'>
                  <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0' />
                </svg>
              </span>
              <input className='form-control' name='search' type='search' placeholder='What do you want to listen to?' aria-label='Search' value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              <button className='btn btn-search' type='submit'>
                <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='currentColor' className='bi bi-arrow-right m-0 p-0' viewBox='0 0 16 16'>
                  <path fillRule='evenodd' d='M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8' />
                </svg>
              </button>
            </div>
          </form>
        </div>
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
      <ToastContainer/>
    </>
  );
}