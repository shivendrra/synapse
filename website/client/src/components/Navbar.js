import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';

export default function Navbar({ onCategoryChange }) {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [username, setUsername] = useState('');
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
    setUsername(localStorage.getItem('name'));
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
            Synapse
          </Link>
          <div className='navbar-items'>
            <ul className='navbar-nav mx-3'>
              <li className='nav-item m-auto px-2'>
                <Link to='/search' className='option-btn'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' fill='currentColor' className='bi bi-search' viewBox='0 0 16 16'>
                    <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0' />
                  </svg>
                </Link>
              </li>
              <li className='nav-item dropdown m-auto px-2'>
                <a className='nav-link dropdown-toggle' href='/' role='button' data-bs-toggle='dropdown' aria-expanded='false'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="currentColor" className="bi bi-list-ul" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
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
                  <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='currentColor' className='bi bi-person-circle text-center' viewBox='0 0 16 16'>
                    <path d='M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0' />
                    <path fillRule='evenodd' d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1' />
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