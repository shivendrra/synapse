import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';
import Avatar, { genConfig } from 'react-nice-avatar';
import './styles/Navbar.css';

export default function Navbar({ onCategoryChange }) {
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [username, setUsername] = useState(null);
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [showNav, setShowNav] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const generateAvatarConfig = useCallback((username) => {
    return genConfig(username);
  }, []);

  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
  };

  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/signup') {
      setShowNav(false);
    } else {
      setShowNav(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const checkUserLoggedIn = () => {
      const token = localStorage.getItem('token');
      setUsername(localStorage.getItem('username'));
      setLoggedInUser(!!token);
    };
    checkUserLoggedIn();
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      const avatar = localStorage.getItem('avatar');
      setUsername(localStorage.getItem('username'));
      if (avatar) {
        setAvatarConfig(JSON.parse(avatar));
      } else {
        const storedUsername = localStorage.getItem('username');
        const newConfig = generateAvatarConfig(storedUsername);
        setAvatarConfig(newConfig);
        localStorage.setItem('avatar', JSON.stringify(newConfig));
      }
    } else {
      setUsername('');
    }
  }, [loggedInUser, username, setAvatarConfig, generateAvatarConfig]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    setUsername('');
    handleSuccess('User logged out Successfully!');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  if (!showNav) {
    return null;
  }

  return (
    <nav className="main-navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to="/">
          {username ? (
            <div className="user-display">
              <div className="avatar-container">
                <Avatar style={{ width: '40px', height: '40px' }} {...avatarConfig} />
              </div>
              <div className="welcome-section">
                <span className="welcome-text">Welcome,</span>
                <span className="username">@{username}</span>
              </div>
            </div>
          ) : (
            <div className="brand-logo">
              <span className="brand-text">Synapse</span>
            </div>
          )}
        </Link>

        <div className="navbar-actions">
          <Link to="/search" className="nav-action-btn" title="Search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <div className="dropdown">
            <button className="nav-action-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Categories">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19V6L21 12L9 19ZM9 19C9 19.5304 8.78929 20.0391 8.41421 20.4142C8.03914 20.7893 7.53043 21 7 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H7C7.53043 3 8.03914 3.21071 8.41421 3.58579C8.78929 3.96086 9 4.46957 9 5V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <ul className="dropdown-menu category-dropdown">
              <li className="dropdown-item" onClick={() => handleCategorySelect('10')}>
                <span className="category-icon">🎵</span>
                Music
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('1')}>
                <span className="category-icon">🎬</span>
                Film & Animation
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('28')}>
                <span className="category-icon">🔬</span>
                Science & Technology
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('23')}>
                <span className="category-icon">😂</span>
                Comedy
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('30')}>
                <span className="category-icon">🎭</span>
                Movies
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('25')}>
                <span className="category-icon">📰</span>
                News & Politics
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('20')}>
                <span className="category-icon">🎮</span>
                Gaming
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('24')}>
                <span className="category-icon">🎪</span>
                Entertainment
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('27')}>
                <span className="category-icon">📚</span>
                Education
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('15')}>
                <span className="category-icon">🚀</span>
                Sci-fi Fantasy
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('17')}>
                <span className="category-icon">⚡</span>
                Action & Adventure
              </li>
              <li className="dropdown-item" onClick={() => handleCategorySelect('22')}>
                <span className="category-icon">👥</span>
                People & Blogs
              </li>
            </ul>
          </div>

          <div className="dropdown">
            <button className="nav-action-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <ul className="dropdown-menu menu-dropdown">
              <li className="dropdown-item">
                <Link to="/profile" className="dropdown-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Account
                </Link>
              </li>
              <li className="dropdown-item disabled">
                <Link to="/" className="dropdown-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Help
                </Link>
              </li>
              <li className="dropdown-item">
                <Link to="/about" className="dropdown-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  About
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li className="dropdown-item logout-item" onClick={handleLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Logout
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}