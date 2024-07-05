import React from "react";
import PropTypes from "prop-types";
import he from "he";

export default function DisplayCards(props) {
  const { title, channel, imageUrl, videoUrl, onPlay, description } = props;
  const handlePlay = () => {
    if (onPlay) {
      onPlay(videoUrl, title, channel);
    }
  };

  return (
    <>
      <div className="display-cards p-0 mt-5">
        <div className="card" onClick={handlePlay} style={{cursor: "pointer"}}>
          <img src={imageUrl} alt={title} className="card-img-top" />
          <div className="card-body">
            <h5 className="card-title video-title" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{he.decode(title)}</h5>
            <p className="card-text">{he.decode(channel)}</p>
            <p className="card-text" style={{ maxWidth: "80vw", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "grey" }}>
              <small style={{ color: "grey" }}>{he.decode(description)}</small>
            </p>
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
  description: PropTypes.string.isRequired,
  onPlay: PropTypes.func.isRequired,
};