import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BottomNav from './BottomNav';

export default function VideoCard(props) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [bottomNav, setBottomNav] = useState(null);

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube IFrame API ready');
    };
  }, []);

  const handlePlay = () => {
    const { videoUrl } = props;

    if (videoUrl) {
      setAudioUrl(videoUrl);
      setBottomNav(true);
    } else {
      setAudioUrl(null);
      setBottomNav(false);
    }
  };

  return (
    <>
      <div className="container m-auto">
        <div
          className="card text-start mb-3 mx-auto"
          onClick={handlePlay}
          style={{ maxWidth: '80%', cursor: 'pointer' }}
        >
          <div className="row mx-0 px-0">
            <div className="col-lg-4 col-xs-4 px-0">
              <img
                src={props.imageUrl}
                className="object-fit-cover img-fluid img-thumbnail"
                style={{ objectFit: 'contain' }}
                alt="..."
              />
            </div>
            <div className="col-lg-8 col-xs-8 bg-white">
              <div className="card-body">
                <h5 className="card-title">{props.title}</h5>
                <p className="card-text">{props.channel}</p>
                <p className="card-text">
                  <small className="text-body-secondary">Video description (to be added!)</small>
                </p>
              </div>
            </div>
          </div>
        </div>
        <BottomNav audioUrl={audioUrl} audioTitle={props.title} state={bottomNav} channelName={props.channel} />
      </div>
    </>
  );
}

VideoCard.propTypes = {
  title: PropTypes.string,
  channel: PropTypes.string,
  imageUrl: PropTypes.string,
  videoUrl: PropTypes.string,
  duration: PropTypes.string,
};