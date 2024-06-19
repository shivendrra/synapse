import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

export default function Navbar(props) {

  return (
    <>
      <nav id="mainNavbar" className={`py-3 navbar navbar-expand-lg fixed-top bg-light`}>
        <div id="innerNav" className="container">
          <Link className='navbar-brand mx-3' to="/">
            Version 1.0
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className='nav-link' to="/youtube">youtube.</Link>
              </li>
              <li className="nav-item">
                <Link className='nav-link' to="/account">account.</Link>
              </li>
              <li className="nav-item">
                <Link className='nav-link' to="/login">login.</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}