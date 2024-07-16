import React, { useState, useEffect, useCallback } from 'react';
import DisplayCards from './DisplayCards';
import { handleError } from '../utils';
import Footer from './Footer';

export default function Home({ category, onPlay }) {
  const [randomVideos, setRandomVideos] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(false);

  useEffect(() => {
    const checkUserLoggedIn = () => {
      const token = localStorage.getItem('token');
      setLoggedInUser(!!token);
    };
    checkUserLoggedIn();
  }, []);

  const fetchRandomVideos = useCallback(async () => {
    try {
      // const url = `http://localhost:3001/content/random-videos?category=${category}`;
      const url = `https://synapse-backend.vercel.app/content/random-videos?category=${category}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error while fetching random videos');
      }
      const results = await response.json();
      setRandomVideos(results);
    } catch (err) {
      handleError(err);
    }
  }, [category]);

  useEffect(() => {
    if (loggedInUser) {
      fetchRandomVideos();
    }
  }, [category, loggedInUser, fetchRandomVideos]);

  if (!loggedInUser) {
    return <h4>Please log in to see content</h4>;
  }

  return (
    <>
      <h4>Welcome, {loggedInUser}</h4>
      <div className='random-videos'>
        {randomVideos.length > 0 && (
          <div className='row'>
            {randomVideos.map((video, index) => (
              <div key={video.videoId} className='col-lg-2 col-sm-6 p-2'>
                <DisplayCards
                  title={video.title}
                  channel={video.channel}
                  imageUrl={video.thumbnailUrl}
                  videoUrl={video.videoId}
                  onPlay={() => onPlay(video.videoId, video.title, video.channel, video.thumbnailUrl, index)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
}