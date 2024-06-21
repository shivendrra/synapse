import React, { useState } from 'react';
import PropTypes from 'prop-types';
import BottomNav from './BottomNav';

export default function VideoCard(props) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [bottomNav, setBottomNav] = useState(null);

  const handlePlay = async () => {
    const { videoUrl, duration } = props;

    if (videoUrl) {
      try {
        const audioUrl = `https://www.youtube.com/watch?v=${videoUrl}&t=${duration || '0s'}`;
        console.log('audio Url fetching worked ' + audioUrl)
        setAudioUrl(audioUrl);
        setBottomNav(' ');

        return audioUrl;
      } catch (error) {
        console.error(error);
        setAudioUrl(null);
        setBottomNav(false);
        return null;
      }
    } else {
      setAudioUrl(null);
      setBottomNav(false);

      return null;
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
        <BottomNav audioUrl={audioUrl} audioTitle={props.title} state={bottomNav}/>
      </div>
    </>
  );
}

VideoCard.propTypes = {
  title: PropTypes.string,
  channel: PropTypes.string,
  imageUrl: PropTypes.string,
  videoUrl: PropTypes.string,
  audioUrl: PropTypes.string,
  duration: PropTypes.string,
};
