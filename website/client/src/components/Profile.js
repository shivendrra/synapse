import React, { useEffect, useState, useCallback } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userN, setUserN] = useState(null);

  useEffect(() => {
    const checkUserLoggedIn = () => {
      const token = localStorage.getItem('token');
      setUsername(localStorage.getItem('username'));
      setLoggedInUser(!!token);
    };
    checkUserLoggedIn();
  }, []);

  const generateAvatarConfig = useCallback((username) => {
    return genConfig(username);
  }, []);

  const updateAvatarInDatabase = useCallback(async (config) => {
    try {
      const response = await fetch('/api/update-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, avatarConfig: config }),
      });
      if (!response.ok) throw new Error('Failed to update avatar');
    } catch (error) {
      console.error('Error updating avatar in database:', error);
    }
  }, [username]);

  const navigate = useNavigate();

  useEffect(() => {
    if (loggedInUser) {
      const storedUsername = localStorage.getItem('username');
      const storedName = localStorage.getItem('name');
      const storedAvatarConfig = localStorage.getItem('avatar');
      const storedEmail = localStorage.getItem('email');
      const storedGender = localStorage.getItem('gender');

      setUserN(username);
      setUsername(storedUsername || '');
      setName(storedName || '');
      setEmail(storedEmail || '');
      setGender(storedGender || '');

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
  }, [loggedInUser, generateAvatarConfig, updateAvatarInDatabase, username]);

  const handleChangeAvatar = () => {
    const newConfig = generateAvatarConfig(username);
    setAvatarConfig(newConfig);
    localStorage.setItem('avatar', JSON.stringify(newConfig));
    updateAvatarInDatabase(newConfig);
  };

  const handleUpdateProfile = async () => {
    try {
      const payload = {
        userId: localStorage.getItem('userId'),
        userN,
        name,
        email,
        gender,
      };

      if (password) {
        payload.password = password;
      };
      // const response = await fetch('https://synapse-backend.vercel.app/auth/update', {
      const response = await fetch('http://localhost:3001/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      handleSuccess('Profile updated successfully!');

      localStorage.setItem('username', data.username);
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', data.email);
      localStorage.setItem('gender', data.gender);
    } catch (error) {
      handleError('There was an error updating the profile!', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // const response = await fetch('https://synapse-backend.vercel.app/auth/delete', {
      const response = await fetch('http://localhost:3001/auth/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: localStorage.getItem('userId') }),
      });

      if (!response.ok) throw new Error('Failed to delete account');
      handleSuccess('Profile deleted successfully');
      localStorage.clear();
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (error) {
      handleError('There was an error deleting the account', error);
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
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
          <div className="col-lg-12 prof-setting">
            <span className='email-de'>
              <h6 className='headers'>email: </h6>
              <h6 className='key'>{email}</h6>
            </span>
            <span className='pass-de'>
              <h6 className='headers'>password: </h6>
              <h6 className='key'>************</h6>
            </span>
            <span className='gender-de'>
              <h6 className='headers'>gender: </h6>
              <h6 className='key'>{gender || 'Not Set'}</h6>
            </span>
            <span className='recent-de'>
              <h6 className='headers'>recent listen: </h6>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" />
              </div>
            </span>
            <span className='update-btn'>
              <button className='btn btn-outline-secondary' style={{ borderRadius: '0px' }} onClick={handleShowModal}>
                Update Profile
              </button>
            </span>
          </div>
          <div className="col-lg-12">
            <hr className='mx-auto' style={{ width: '50%' }} />
          </div>
          <div className="col-lg-12 prof-del">
            <span className="del-account">
              <h6>Delete Your Account</h6>
              <button className='btn btn-outline-danger' style={{ borderRadius: '0px' }} onClick={handleDeleteAccount}>
                Confirm delete
              </button>
            </span>
          </div>
          {showModal && (
            <div className="modal" style={{ display: 'block' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Update Profile</h5>
                    <button type="button" className="close" onClick={handleCloseModal}>
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className='user-de'>
                      <h6 className='headers'>username: </h6>
                      <input
                        type="text"
                        value={userN || ''}
                        onChange={(e) => setUserN(e.target.value)}
                        className='key'
                      />
                    </div>
                    <div className='email-de'>
                      <h6 className='headers'>email: </h6>
                      <input
                        type="email"
                        value={email || ''}
                        onChange={(e) => setEmail(e.target.value)}
                        className='key'
                      />
                    </div>
                    <div className='pass-de'>
                      <h6 className='headers'>password: </h6>
                      <input
                        type="password"
                        value={password || ''}
                        onChange={(e) => setPassword(e.target.value)}
                        className='key'
                      />
                    </div>
                    <div className='gender-de'>
                      <h6 className='headers'>gender: </h6>
                      <select
                        name="gender"
                        value={gender || ''}
                        onChange={(e) => setGender(e.target.value)}
                        className='key'
                      >
                        <option value="">Please select one…</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="non-binary">Non-Binary</option>
                        <option value="other">Other</option>
                        <option value="Prefer not to answer">Prefer not to Answer</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                    <button type="button" className="btn btn-primary" onClick={handleUpdateProfile}>Save changes</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="col-lg-4 col-sm-3 m-auto text-center">
            <br />
            <hr />
            <br />
            <h2 className='footer-title'>Synapse</h2>
            <h6 className='blockquote-footer pt-3'>Version 1.1</h6>

            <br />
            <h5 style={{ fontSize: 'smaller' }}>made by: <span className='maker-url'><a href='https://shivendrra.vercel.app/' target='blank'>@shivendrra_</a></span></h5>
            <br />
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}