import React, { useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import DisplayCards from "./DisplayCards";

export default function Home({ category }) {
  const [randomVideos, setRandomVideos] = useState([]);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [bottomNav, setBottomNav] = useState(false);
  const [audioTitle, setAudioTitle] = useState("");
  const [channelName, setChannelName] = useState("");
  const [imsSrc, setImsSrc] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  console.log(error);
  useEffect(() => {
    const fetchRandomVideos = async () => {
      try {
        // const response = await fetch(`http://localhost:3001/random-videos?category=${category}`);
        const response = await fetch(`https://synapse-backend.vercel.app/random-videos?category=${category}`);
        if (!response.ok) {
          throw new Error("Error while fetching random videos");
        }
        const data = await response.json();
        setRandomVideos(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchRandomVideos();
  }, [category]);

  const handlePlay = (videoUrl, title, channel, imageUrl, index) => {
    setAudioUrl(videoUrl);
    setAudioTitle(title);
    setChannelName(channel);
    setImsSrc(imageUrl);
    setCurrentIndex(index);
    setBottomNav(true);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % randomVideos.length;
    const nextVideo = randomVideos[nextIndex];
    handlePlay(nextVideo.videoId, nextVideo.title, nextVideo.channel, nextVideo.thumbnailUrl, nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + randomVideos.length) % randomVideos.length;
    const prevVideo = randomVideos[prevIndex];
    handlePlay(prevVideo.videoId, prevVideo.title, prevVideo.channel, prevVideo.thumbnailUrl, prevIndex);
  };

  return (
    <>
      <div className="random-videos">
        {randomVideos.length > 0 && (
          <div className="row">
            {randomVideos.map((video, index) => (
              <div key={video.videoId} className="col-lg-2 col-sm-6 p-2">
                <DisplayCards
                  title={video.title}
                  channel={video.channel}
                  imageUrl={video.thumbnailUrl}
                  videoUrl={video.videoId}
                  onPlay={() => handlePlay(video.videoId, video.title, video.channel, video.thumbnailUrl, index)}
                />
              </div>
            ))}
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
    </>
  );
}
