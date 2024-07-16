import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';

export default function Navbar({ onCategoryChange }) {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [username, setUsername] = useState(null);
  const [showNav, setShowNav] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
    setLoggedInUser(true);
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      setUsername(localStorage.getItem('name'));
    }
    else {
      setUsername('');
    }
  }, [loggedInUser, username]);

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
            {username ? <span className='welcome-msg'><span style={{ fontSize: 'smaller', color: '#A9C52F' }}>Welcome,</span><br /> {username}</ span> : 'Synapse'}
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
                    <path fill-rule="evenodd" d="M12 3v10h-1V3z" />
                    <path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1z" />
                    <path fill-rule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5" />
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
                    <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
                  </svg>
                </a>
                <ul className='dropdown-menu dropdown-menu-end dropdown-menu-sm'>
                  <li className='dropdown-item'>Account</li>
                  <li className='dropdown-item'>Help</li>
                  <li className='dropdown-item' disable>Manage</li>
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