import React from 'react'

export default function Login(props) {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/login';
  };
  return (
    <>
      <div className="login-form">
        <div className="main-login pb-3">
          <form class="row g-3">
            <div class="col-md-6">
              <label for="inputName4" class="form-label">Name</label>
              <input type="text" class="form-control" id="inputName4" required />
            </div>
            <div class="col-md-6">
              <label for="inputUsername4" class="form-label">Username</label>
              <input type="text" class="form-control" id="inputUsername4" required />
            </div>
            <div class="col-md-6">
              <label for="inputEmail4" class="form-label">Email</label>
              <input type="email" class="form-control" id="inputEmail4" required />
            </div>
            <div class="col-md-6">
              <label for="inputPassword4" class="form-label">Password</label>
              <input type="password" class="form-control" id="inputPassword4" required />
            </div>
            <div class="col-12">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="gridCheck" required />
                <label class="form-check-label" for="gridCheck">
                  I've read the terms & conditions and I agree!
                </label>
              </div>
            </div>
            <div class="col-12 text-center">
              <button type="submit" class="btn btn-outline-success">Sign in</button>
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
