import React from 'react';
import VideoCard from './VideoCard';

export default function DisplayResults() {
  return (
    <>
      {videos.length > 0 && (
        <div className="video-results py-5">
          <div className="container">
            <div className="row">
              {videos.map((video) => (
                <div key={video.videoId} className="col-lg-12">
                  <VideoCard
                    title={video.title}
                    channel={video.channel}
                    imageUrl={video.thumbnailUrl}
                    videoUrl={video.videoId}
                    onPlay={handlePlay}
                    description={video.description}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </>
  )
}
