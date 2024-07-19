import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import he from 'he';
import axios from 'axios';

// const addPlaylist = async (username, playlistName, song) => {
//   try {
//     const response = await fetch('http://localhost:3001/playlists/add-playlist', {
//       // const response = await fetch('https://synapse-backend.vercel.app/playlists/add-playlist', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         username,
//         playlistName,
//         song,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to add playlist');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error adding playlist:', error);
//     throw error;
//   }
// };

// const getPlaylists = async (username) => {
//   try {
//     const response = await fetch(`http://localhost:3001/playlists/get-playlists/${username}`);
//     // const response = await fetch(`https://synapse-backend.vercel.app/playlists/get-playlists/${username}`);

//     if (!response.ok) {
//       throw new Error('Failed to get playlists');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error getting playlists:', error);
//     throw error;
//   }
// };

export default function DisplayCards(props) {
  const { title, channel, imageUrl, videoUrl, onPlay, channelId, username } = props;
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [queue, setQueue] = useState([]);
  const audioRef = useRef(null);

  const newSong = {
    videoId: videoUrl,
    title,
    channel,
    thumbnailUrl: imageUrl,
  };

  // useEffect(() => {
  //   const fetchPlaylists = async () => {
  //     try {
  //       if (username) {
  //         const data = await getPlaylists(username);
  //         setPlaylists(data.playlists);
  //       } else {
  //         console.error('Username is not defined');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching playlists:', error);
  //     }
  //   };

  //   fetchPlaylists();
  // }, [username]);

  const handlePlay = useCallback((song) => {
    if (onPlay) {
      onPlay(song.videoId, song.title, song.channel);
    }
  }, [onPlay]);

  const handleAddQueue = () => {
    setQueue([...queue, newSong]);
    console.log('Added to queue');
  };

  const handleDownload = async () => {
    try {
      // const response = await axios.get('https://synapse-backend.vercel.app/download', {
      const response = await axios.get('http://localhost:3001/download', {
        params: { id: videoUrl },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audio.mp3');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading the video', error);
    }
  };

  // const handleAddPlaylist = async (playlistName) => {
  //   try {
  //     await addPlaylist(username, playlistName, newSong);
  //     const data = await getPlaylists(username);
  //     setPlaylists(data.playlists);
  //   } catch (error) {
  //     console.error('Error adding playlist:', error);
  //   }
  // };

  // const handleAddToPlaylist = async (playlistName) => {
  //   if (!playlistName) {
  //     setShowPlaylistModal(true);
  //   } else {
  //     await handleAddPlaylist(playlistName);
  //   }
  // };

  // const handleCreatePlaylist = async () => {
  //   if (newPlaylistName) {
  //     await handleAddPlaylist(newPlaylistName);
  //     setShowPlaylistModal(false);
  //     setNewPlaylistName('');
  //   }
  // };

  const playNextSong = useCallback(() => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(queue.slice(1));
      handlePlay(nextSong);
    } else {
    }
  }, [queue, handlePlay]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('ended', playNextSong);
      return () => {
        audioElement.removeEventListener('ended', playNextSong);
      };
    }
  }, [playNextSong]);

  return (
    <>
      <div className='display-cards p-0 mt-5'>
        <div className='card' style={{ cursor: 'pointer' }}>
          <img src={imageUrl} alt={title} className='card-img-top' onClick={() => handlePlay(newSong)} />
          <div className='card-body px-2 d-flex'>
            <div className='col-lg-11' onClick={() => handlePlay(newSong)}>
              <h5 className='card-title video-title' style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{he.decode(title)}</h5>
              <p className='card-text'>
                <Link to={`/channel?channelId=${channelId}`} className='channel-link'>{he.decode(channel)}</Link>
              </p>
            </div>
            <div className='col-lg-1'>
              <div className="dropdown">
                <button className="option-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='currentColor' className='bi bi-three-dots-vertical' viewBox='0 0 16 16'>
                    <path d='M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0' />
                  </svg>
                </button>
                <ul className='dropdown-menu'>
                  <li>
                    <button className='dropdown-item' onClick={() => handlePlay(newSong)}>
                      Play Now
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item' onClick={handleAddQueue}>
                      Add to Queue
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item' onClick={handleDownload}>
                      Download
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item disabled' onClick={() => handleAddToPlaylist(null)}>
                      Add to Playlist
                    </button>
                  </li>
                  {playlists.map((playlist) => (
                    <li key={playlist.name}>
                      <button className='dropdown-item' onClick={() => handleAddToPlaylist(playlist.name)}>
                        {playlist.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPlaylistModal && (
        <div className='modal show d-block pt-5 px-4'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Create New Playlist</h5>
                <button type='button' className='btn-close' onClick={() => setShowPlaylistModal(false)}></button>
              </div>
              <div className='modal-body'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='New Playlist Name'
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                />
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' onClick={() => setShowPlaylistModal(false)}>
                  Cancel
                </button>
                <button type='button' className='btn btn-primary' onClick={handleCreatePlaylist}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

DisplayCards.propTypes = {
  title: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
  onPlay: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
};