import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import he from 'he';

export default function VideoCard(props) {
  const { title, channel, imageUrl, videoUrl, onPlay, channelId, description } = props;

  const handlePlay = () => {
    if (onPlay) {
      onPlay(videoUrl, title, channel);
    }
  };

  return (
    <div className='video-card m-auto'>
      <div className='card text-start mb-3 mx-auto' style={{ maxWidth: '80%', cursor: 'pointer' }}>
        <div className='row'>
          <div className='col-lg-5 col-sm-5 p-0 m-0' onClick={handlePlay}>
            <img src={imageUrl} className='img-fluid vid-img' alt='...' />
          </div>
          <div className='col-lg-7 col-sm-7'>
            <div className='card-body px-1'>
              <h5 className='card-title' style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={handlePlay}>{he.decode(title)}</h5>
              <p className='card-text channel'>
                <Link to={`/channel?channelId=${channelId}`} className='channel-link'>{he.decode(channel)}</Link>
              </p>
              <p className='card-text' style={{ maxWidth: '80vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'grey' }}>
                <small style={{ color: 'grey' }} >{he.decode(description)}</small>
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