import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';
import Avatar, { genConfig } from 'react-nice-avatar';

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
      }
      else {
        const storedUsername = localStorage.getItem('username');
        const newConfig = generateAvatarConfig(storedUsername);
        setAvatarConfig(newConfig);
        localStorage.setItem('avatar', JSON.stringify(newConfig));
      }
    }
    else {
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
    <>
      <nav id='mainNavbar' className={`navbar navbar-expand fixed-top d-${showNav}`} style={{ display: `${showNav}` }}>
        <div id='innerNav' className='container-fluid'>
          <Link className='navbar-brand mx-3' to='/'>
            {username ? <span className='user-display'>
              <Avatar style={{ width: '3rem', height: '3rem' }} {...avatarConfig} />
              <span className='welcome-msg ms-3'>
                <span style={{ fontSize: 'smaller', color: '#A9C52F' }}>
                  Welcome,
                </span>
                <br />
                @{username}
              </ span>
            </span> :
              'Synapse'}
          </Link>
          <div className='navbar-items'>
            <ul className='navbar-nav ms-3'>
              <li className='nav-item m-auto px-2'>
                <Link to='/search' className='option-btn nav-link'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                  </svg>
                </Link>
              </li>
              <li className='nav-item dropdown m-auto px-2'>
                <a className='nav-link dropdown-toggle' href='/' role='button' data-bs-toggle='dropdown' aria-expanded='false'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-music-note-list sp" viewBox="0 0 16 16">
                    <path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2" />
                    <path fillRule="evenodd" d="M12 3v10h-1V3z" />
                    <path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1z" />
                    <path fillRule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5" />
                  </svg>
                </a>
                <ul className='dropdown-menu dropdown-menu-end'>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('10')}>Music</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('1')}>Film & Animation</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('28')}>Science & Technology</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('23')}>Comedy</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('30')}>Movies</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('25')}>News & Politics</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('20')}>Gaming</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('24')}>Entertainment</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('27')}>Education</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('15')}>Sci-fi Fantasy</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('17')}>Action & Adventure</li>
                  <li className='dropdown-item' onClick={() => handleCategorySelect('22')}>People & Blogs</li>
                </ul>
              </li>
              <li className='nav-item dropdown m-auto px-2'>
                <a className='nav-link dropdown-toggle' href='/' role='button' data-bs-toggle='dropdown' aria-expanded='false'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="currentColor" className="bi bi-list sp" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
                  </svg>
                </a>
                <ul className='dropdown-menu dropdown-menu-end dropdown-menu-sm'>
                  <li className='dropdown-item'>
                    <Link to="/profile" className='drop-link' style={{ textDecoration: 'none', color: 'black' }}>
                      Account
                    </Link>
                  </li>
                  <li className='dropdown-item disabled'>
                    <Link to="/" className='drop-link' style={{ textDecoration: 'none', color: 'black' }}>
                      Help
                    </Link>
                  </li>
                  <li className='dropdown-item'>
                    <Link to="/about" className='drop-link' style={{ textDecoration: 'none', color: 'black' }}>
                      About
                    </Link>
                  </li>
                  <li><hr className='dropdown-divider' /></li>
                  <li className='dropdown-item' onClick={handleLogout}>Logout</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}