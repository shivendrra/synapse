import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <nav id="mainNavbar" className={`navbar navbar-expand-lg fixed-top`}>
        <div id="innerNav" className="container">
          <Link className="navbar-brand mx-3" to="/">
            Synapse
          </Link>
          <div className="navbar-items">
            <ul className="navbar-nav ms-auto mx-3">
              <li className="nav-item">
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
  )
}