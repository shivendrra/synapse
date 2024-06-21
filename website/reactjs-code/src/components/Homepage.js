import React, { useState } from 'react';
import VideoCard from './VideoCard';

export default function Homepage() {
  const [searchText, setSearchText] = useState('');
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/search', {
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
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <div className="form-div container text-center">
        <form onSubmit={handleSubmit}>
          <div className="head-sec mb-2">
            <h2 className="mb-2" style={{ fontSize: '60px' }}>
              Synapse
            </h2>
            <p>Stream music for free, No ads!!</p>
          </div>
          <input className="m-2 form-control" type="text" aria-label="search" id="search" placeholder="Enter a string to search"
            value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <button className="btn btn-outline-dark" type="submit">
            Search
          </button>
        </form>
        {videos.length > 0 && (
          <div className='search-result py-5'>
            <h3 className='pb-4'>Search Results:</h3>
            <div className="container">
              {videos.map((video, index) => (
                <div key={video.videoId}>
                  <VideoCard title={video.title} channel={video.channel} imageUrl={video.thumbnailUrl} videoUrl={video.videoId}/>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <p>Error: {error}</p>}
      </div>
    </>
  );
}
