import React, { useState } from 'react';
import VideoCard from './VideoCard';

export default function Home() {
  const [searchText, setSearchText] = useState("");
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
      <div className='mainHeader row'>
        <form action="POST" onSubmit={handleSubmit}>
          <div className="input-group search-bar">
            <span className='input-group-text' id='basic-addon1'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </span>
            <input className="form-control" type="search" placeholder="What do you want to listen to?" aria-label="Search"
              value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <button className="btn btn-search" type="submit">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-arrow-right m-0 p-0" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
      <div className="video-results">
        {videos.length > 0 && (
          <div className='search-result py-5'>
            <h3 className='pb-4'>Search Results:</h3>
            <div className="container">
              {videos.map((video, index) => (
                <div key={video.videoId}>
                  <VideoCard title={video.title} channel={video.channel} imageUrl={video.thumbnailUrl} videoUrl={video.videoId} />
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <p>Error: {error}</p>}
      </div>
    </>
  )
}