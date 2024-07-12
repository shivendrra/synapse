import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';

export default function Navbar({ onCategoryChange }) {
  const [searchText, setSearchText] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');
  const navigate = useNavigate();

  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
  };

  useEffect(() => {
    setLoggedInUser(localStorage.getItem('loggedInUser'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('User logged out Successfully!');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchText }),
      });

      if (!response.ok) {
        throw new Error('Error while fetching videos');
      }
      const data = await response.json();
      navigate('/search', { state: { videos: data, error: null } });
    } catch (error) {
      navigate('/search', { state: { videos: [], error: error.message } });
    }
  };

  return (
    <>
      <nav id='mainNavbar' className={`navbar navbar-expand fixed-top`}>
        <div id='innerNav' className='container-fluid'>
          <Link className='navbar-brand mx-3' to='/'>
            Synapse
          </Link>
          <div className='navbar-items'>
            <ul className='navbar-nav mx-3'>
              <li className='nav-item m-auto'>
                <form action='POST' onSubmit={handleSubmit}>
                  <div className='input-group search-bar'>
                    <span className='input-group-text' id='basic-addon1'>
                      <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='currentColor' className='bi bi-search' viewBox='0 0 16 16'>
                        <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0' />
                      </svg>
                    </span>
                    <input className='form-control' type='search' placeholder='What do you want to listen to?' aria-label='Search' value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                    <button className='btn btn-search' type='submit'>
                      <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='currentColor' className='bi bi-arrow-right m-0 p-0' viewBox='0 0 16 16'>
                        <path fillRule='evenodd' d='M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8' />
                      </svg>
                    </button>
                  </div>
                </form>
              </li>
              <li className='nav-item dropdown ms-3'>
                <a className='nav-link dropdown-toggle' href='/' role='button' data-bs-toggle='dropdown' aria-expanded='false'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='currentColor' className='bi bi-tags' viewBox='0 0 16 16'>
                    <path d='M3 2v4.586l7 7L14.586 9l-7-7zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586z' />
                    <path d='M5.5 5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m0 1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M1 7.086a1 1 0 0 0 .293.707L8.75 15.25l-.043.043a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 0 7.586V3a1 1 0 0 1 1-1z' />
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
              {loggedInUser ? (
                <li className='nav-item ms-3'>
                  <span className='nav-link' onClick={handleLogout}>
                    {loggedInUser}
                  </span>
                </li>
              ) : (
                <li className='nav-item ms-3'>
                  <Link className='nav-link' to='/login'>
                    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='currentColor' className='bi bi-person-circle text-center' viewBox='0 0 16 16'>
                      <path d='M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0' />
                      <path fillRule='evenodd' d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1' />
                    </svg>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}