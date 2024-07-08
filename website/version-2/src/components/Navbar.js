import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ onCategoryChange }) {
  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
  };

  return (
    <>
      <nav id="mainNavbar" className={`navbar navbar-expand fixed-top`}>
        <div id="innerNav" className="container">
          <Link className="navbar-brand mx-3" to="/">
            Synapse
          </Link>
          <div className="navbar-items">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown ms-3">
                <a className="nav-link dropdown-toggle" href="/" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-tags" viewBox="0 0 16 16">
                    <path d="M3 2v4.586l7 7L14.586 9l-7-7zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586z" />
                    <path d="M5.5 5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m0 1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M1 7.086a1 1 0 0 0 .293.707L8.75 15.25l-.043.043a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 0 7.586V3a1 1 0 0 1 1-1z" />
                  </svg>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li className="dropdown-item" onClick={() => handleCategorySelect("10")}>Music</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("1")}>Film & Animation</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("28")}>Science & Technology</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("23")}>Comedy</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("30")}>Movies</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("25")}>News & Politics</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("20")}>Gaming</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("24")}>Entertainment</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("27")}>Education</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("15")}>Sci-fi Fantasy</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("17")}>Action & Adventure</li>
                  <li className="dropdown-item" onClick={() => handleCategorySelect("22")}>People & Blogs</li>
                </ul>
              </li>
              <li className="nav-item ms-3">
                <Link className="nav-link" to="/login">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-person-circle text-center" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}