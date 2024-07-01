import React from 'react'

export default function AudioPlayer(props) {
  return (
    <>
      <div className="audio-container">
        <audio src={props.video?.audioUrl} id='current-song' preload='true' autoPlay />
      </div>
    </>
  )
}
