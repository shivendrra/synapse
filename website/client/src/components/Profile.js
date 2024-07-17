import React, { useEffect, useState, useCallback } from 'react';
import PlaylistShow from './PlaylistShow';
import Avatar, { genConfig } from 'react-nice-avatar';
import axios from 'axios';

import pic1 from './img/1.jpg';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(false);
  const email = localStorage.getItem('email');

  const generateAvatarConfig = useCallback((username) => {
    return genConfig(username);
  }, []);

  const updateAvatarInDatabase = useCallback(async (config) => {
    try {
      await axios.post('/api/update-avatar', {
        username,
        avatarConfig: config,
      });
    } catch (error) {
      console.error('Error updating avatar in database:', error);
    }
  }, [username]);

  useEffect(() => {
    setLoggedInUser(true);
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      const storedUsername = localStorage.getItem('username');
      const storedName = localStorage.getItem('name');
      const storedAvatarConfig = localStorage.getItem('avatar');
      setUsername(storedUsername);
      setName(storedName);

      if (storedAvatarConfig) {
        setAvatarConfig(JSON.parse(storedAvatarConfig));
      } else {
        const newConfig = generateAvatarConfig(storedUsername);
        setAvatarConfig(newConfig);
        localStorage.setItem('avatar', JSON.stringify(newConfig));
        updateAvatarInDatabase(newConfig);
      }
    } else {
      setUsername('');
      setName('');
      setAvatarConfig(null);
    }
  }, [loggedInUser, generateAvatarConfig, updateAvatarInDatabase]);

  const handleChangeAvatar = () => {
    const newConfig = generateAvatarConfig(username);
    console.log('New Avatar Config:', newConfig);
    setAvatarConfig(newConfig);
    localStorage.setItem('avatarConfig', JSON.stringify(newConfig));
    updateAvatarInDatabase(newConfig);
  };


  return (
    <div className="profile-page">
      <div className="row">
        <div className="col-lg-12 prof-head">
          {avatarConfig && <Avatar style={{ width: '8rem', height: '8rem' }} {...avatarConfig} />}
          <button className='option-btn' onClick={handleChangeAvatar} style={{ color: '#BDC3C7', textDecoration: 'underline' }}>Change Avatar</button>
          <br />
          <h3 className="name">{name}</h3>
          <p className="username">@{username}</p>
        </div>
        <div className="col-lg-12">
          <hr className='mx-auto' style={{ width: '50%' }} />
        </div>
        <div className="col-lg-12 prof-body">
          <div className="col-lg-4 feat-playlist">
            <PlaylistShow imgSrc={pic1} title={'My Playlist 1'} username={username}/>
          </div>
          <div className="col-lg-4 feat-playlist">
            <PlaylistShow imgSrc={pic1} title={'My Playlist 1'} username={username}/>
          </div>
          <div className="col-lg-4 feat-playlist">
            <PlaylistShow imgSrc={pic1} title={'My Playlist 1'} username={username}/>
          </div>
        </div>
        <div className="col-lg-12">
          <hr className='mx-auto' style={{ width: '50%' }} />
        </div>
        <div className="col-lg-12 prof-setting">
          <span className='email-de'>
            <h6 className='headers'>email: </h6>
            <h6 className='key'>{email}</h6>
          </span>
          <span className='pass-de'>
            <h6 className='headers'>password: </h6>
            <h6 className='key'>************</h6>
          </span>
          <span className='recent-de'>
            <h6 className='headers'>recent listen: </h6>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" />
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}