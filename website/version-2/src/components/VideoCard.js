import React from 'react';
import PropTypes from 'prop-types';
import he from 'he';

export default function VideoCard(props) {
  const { title, channel, imageUrl, videoUrl, onPlay, description} = props;

  const handlePlay = () => {
    if (onPlay) {
      onPlay(videoUrl, title, channel);
    }
  };

  return (
    <div className="video-card m-auto">
      <div
        className="card text-start mb-3 mx-auto"
        onClick={handlePlay}
        style={{ maxWidth: '80%', cursor: 'pointer' }}
      >
        <div className="row mx-0 px-0">
          <div className="col-lg-4 col-xs-4 px-0">
            <img
              src={imageUrl}
              className="object-fit-cover img-fluid img-thumbnail"
              style={{ objectFit: 'contain' }}
              alt="..."
            />
          </div>
          <div className="col-lg-8 col-xs-8 bg-white">
            <div className="card-body">
              <h5 className="card-title">{he.decode(title)}</h5>
              <p className="card-text">{he.decode(channel)}</p>
              <p className="card-text" style={{maxWidth: '80vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                <small className="text-body-secondary" >{he.decode(description)}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

VideoCard.propTypes = {
  title: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onPlay: PropTypes.func.isRequired,
};