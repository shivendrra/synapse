import React from 'react';
import PropTypes from 'prop-types';
import he from 'he';

export default function VideoCard(props) {
  const { title, channel, imageUrl, videoUrl, onPlay, description } = props;

  const handlePlay = () => {
    if (onPlay) {
      onPlay(videoUrl, title, channel);
    }
  };

  return (
    <div className="video-card m-auto">
      <div className="card text-start mb-3 mx-auto" onClick={handlePlay} style={{ maxWidth: '80%', cursor: 'pointer' }}>
        <div className="row">
          <div className="col-lg-5 col-xs-4 p-0 m-0">
            <img src={imageUrl} className="img-fluid img-thumbnail" style={{ objectFit: 'contain' }} alt="..." />
          </div>
          <div className="col-lg-7 col-xs-8 bg-white">
            <div className="card-body px-1">
              <h5 className="card-title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{he.decode(title)}</h5>
              <p className="card-text">{he.decode(channel)}</p>
              <p className="card-text" style={{ maxWidth: '80vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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