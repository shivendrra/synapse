import React from 'react'

export default function Login(props) {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/login';
  };
  return (
    <>
      <div className="login-form">
        <div className="main-login pb-3">
          <form className="row g-3">
            <div className="col-md-6">
              <label for="inputName4" className="form-label">Name</label>
              <input type="text" className="form-control" id="inputName4" required />
            </div>
            <div className="col-md-6">
              <label for="inputUsername4" className="form-label">Username</label>
              <input type="text" className="form-control" id="inputUsername4" required />
            </div>
            <div className="col-md-6">
              <label for="inputEmail4" className="form-label">Email</label>
              <input type="email" className="form-control" id="inputEmail4" required />
            </div>
            <div className="col-md-6">
              <label for="inputPassword4" className="form-label">Password</label>
              <input type="password" className="form-control" id="inputPassword4" required />
            </div>
            <div className="col-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="gridCheck" required />
                <label className="form-check-label" for="gridCheck">
                  I've read the terms & conditions and I agree!
                </label>
              </div>
            </div>
            <div className="col-12 text-center">
              <button type="submit" className="btn btn-outline-success">Sign in</button>
            </div>
          </form>
        </div>
        <div className="yt-login px-2 text-center">
          <button type="button" className="btn btn-outline-danger" onClick={handleLogin}>Sign in with YouTube</button>
        </div>
      </div>
    </>
  )
}
