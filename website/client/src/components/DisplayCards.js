import React from 'react';
import PropTypes from 'prop-types';
import he from 'he';

export default function DisplayCards(props) {
  const { title, channel, imageUrl, videoUrl, onPlay } = props;
  const handlePlay = () => {
    if (onPlay) {
      onPlay(videoUrl, title, channel);
    }
  };

  return (
    <>
      <div className='display-cards p-0 mt-5'>
        <div className='card' onClick={handlePlay} style={{ cursor: 'pointer' }}>
          <img src={imageUrl} alt={title} className='card-img-top' />
          <div className='card-body px-2 d-flex'>
            <div className='col-lg-11'>
              <h5 className='card-title video-title' style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{he.decode(title)}</h5>
              <p className='card-text'>{he.decode(channel)}</p>
            </div>
            <div className='col-lg-1'>
              <button className='option-btn'>
                <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='currentColor' className='bi bi-three-dots-vertical' viewBox='0 0 16 16'>
                  <path d='M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0' />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

DisplayCards.propTypes = {
  title: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
  onPlay: PropTypes.func.isRequired,
};