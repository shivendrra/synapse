import React from 'react';

export default function BottomNav(props) {
  const { state, audioTitle, audioUrl } = props;

  return (
    <div className={`nav-btm__wrapper container ${!state && 'd-none'}`}>
      <nav className='navbar-nav bg-light py-2 mt-1 bottom-nav rounded mb-4' role='navigation'>
        <div id="innerNav" className='container text-center mt-2'>
          <div className="audio-container">
            <h4 className='text-start'>{audioTitle}</h4>
            <audio src={audioUrl} id='current-song' preload='auto' autoPlay controls />
          </div>
        </div>
      </nav>
    </div>
  );
}
