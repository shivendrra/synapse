import React, { useState } from "react";
import axios from "axios";

export default function Login(props) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/save-user", formData);
      // const response = await axios.post("https://synapse-backend.vercel.app/save-user", formData);
      console.log(response.data);
      alert("User data saved successfully");
    } catch (error) {
      console.error(error);
      alert("Error saving user data");
    }
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:3001/auth/login";
    // window.location.href = "https://synapse-backend.vercel.app/auth/login";
  };

  return (
    <>
      <div className="login-form">
        <div className="main-login pb-3">
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-6">
              <label htmlFor="inputName4" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="inputName4"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="inputUsername4" className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                id="inputUsername4"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="inputEmail4" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="inputEmail4"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="inputPassword4" className="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                id="inputPassword4"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autocomplete="current-password" />
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="gridCheck"
                  required
                />
                <label className="form-check-label" htmlFor="gridCheck">
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
  );
}