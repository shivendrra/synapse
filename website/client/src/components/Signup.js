import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

export default function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    const copySignupInfo = { ...signupInfo };
    copySignupInfo[name] = value;
    setSignupInfo(copySignupInfo);
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, username, email, password } = signupInfo;
    if (!name || !username || !email || !password) {
      return handleError('All fields are required!');
    }
    try {
      // const url = 'http://localhost:3001/auth/signup';
      const url = 'https://synapse-backend.vercel.app/auth/signup';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupInfo)
      });
      const results = await response.json();
      const { success, message, error } = results;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
      else if (!error) {
        const details = error?.details[0].message;
        handleError(details);
      }
      else if (!success) {
        handleError(message);
      }
    } catch (err) {
      handleError(err);
    }
  }
  return (
    <>
      <div className='signup container m-auto'>
        <h2 className='text-center'>Create account for Synapse</h2>
        <hr />
        <div className='main-signup'>
          <form className='row g-4' onSubmit={handleSignup}>
            <div className='col-md-12'>
              <div className="input-group">
                <span className='input-group-text' id='basic-addon1'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' className='bi bi-people' viewBox='0 0 16 16'>
                    <path d='M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4' />
                  </svg>
                </span>
                <input className='form-control' type='text' name='name' value={signupInfo.name} autoFocus placeholder='Enter your name' onChange={handleChange} aria-label='Name' aria-describedby='basic-addon1' />
              </div>
            </div>
            <div className="col-md-12">
              <div className='input-group'>
                <span className='input-group-text' id='basic-addon2'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' className='bi bi-person-vcard' viewBox='0 0 16 16'>
                    <path d='M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4m4-2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5M9 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 9 8m1 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5' />
                    <path d='M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8.96q.04-.245.04-.5C9 10.567 7.21 9 5 9c-2.086 0-3.8 1.398-3.984 3.181A1 1 0 0 1 1 12z' />
                  </svg>
                </span>
                <input className='form-control' type='text' name='username' value={signupInfo.username} autoFocus placeholder='Create a username' onChange={handleChange} aria-label='Username' aria-describedby='basic-addon2' />
              </div>
            </div>
            <div className="col-md-12">
              <div className='input-group'>
                <span className='input-group-text' id='basic-addon3'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' className='bi bi-envelope-at' viewBox='0 0 16 16'>
                    <path d='M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z' />
                    <path d='M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.21C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648m-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z' />
                  </svg>
                </span>
                <input className='form-control' type='email' name='email' value={signupInfo.email} autoFocus placeholder='example@email.com' onChange={handleChange} aria-label='Email' aria-describedby='basic-addon3' />
              </div>
            </div>
            <div className="col-md-12">
              <div className='input-group'>
                <span className='input-group-text' id='basic-addon4'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' className='bi bi-key' viewBox='0 0 16 16'>
                    <path d='M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5' />
                    <path d='M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0' />
                  </svg>
                </span>
                <input className='form-control' type='password' name='password' value={signupInfo.password} autoFocus placeholder='Password' onChange={handleChange} aria-label='Password' aria-describedby='basic-addon4' />
              </div>
            </div>
            <div className="col-md-12 text-center">
              <button className='btn btn-outline-success' type='submit'>
                Sign-in
              </button>
            </div>
            <div className="col-md-12 text-center">
              <span>Already have an account? <Link to='/login'>Login</Link></span>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  )
}
