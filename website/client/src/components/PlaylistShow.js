import React from 'react';

export default function PlaylistShow(props) {
  return (
    <>
      <div className="playlists m-auto">
        <div className="card">
          <div className="row g-0">
            <div className="col-md-4 col-sm-4 m-auto">
              <img src={props.imgSrc} className="img-fluid playlist-img" alt="..." />
            </div>
            <div className="col-md-8 col-sm-8 m-auto">
              <div className="card-body">
                <h5 className="card-title">{props.title}</h5>
                <p>{props.username}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
