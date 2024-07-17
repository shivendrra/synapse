import React, { useEffect, useState, useCallback } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';
import axios from 'axios';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(false);

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
        <hr />
        <div className="col-lg-12 prof-body"></div>
        <div className="col-lg-12 prof-setting"></div>
      </div>
    </div>
  );
}