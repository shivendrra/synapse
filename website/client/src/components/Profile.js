import React, { useEffect, useState } from 'react';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(false);

  useEffect(() => {
    setLoggedInUser(true);
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      setUsername(localStorage.getItem('username'));
      setName(localStorage.getItem('name'));
    }
    else {
      setUsername('');
      setName('');
    }
  }, [loggedInUser, username, name]);

  return (
    <>
    <div className="profile-page">
      <div className="row">
        <div className="col-lg-12 prof-head">
          <img src={{}} alt="..." />
          <h3 className='name'>{name}</h3>
          <p className='username'>@{username}</p>
        </div>
        <div className="col-lg-12 prof-body"></div>
        <div className="col-lg-12 prof-setting"></div>
      </div>
    </div>
    </>
  )
}