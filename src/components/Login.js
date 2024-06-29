// Login.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'  // Include credentials in the request
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          navigate('/main'); // Redirect to the main page after successful login
        } else {
          alert(data.message);
          if (data.errors) {
            setErrors(data.errors);
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div id="login-register">
      <div>
        <button className="button-style" onClick={() => navigate('/register')}>New? You can register here.</button>
      </div>
      <form id="form" onSubmit={handleLogin}>
        <div id="form-piece">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {errors.username && <span className="error">{errors.username}</span>}
        </div>
        <div id="form-piece">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        <button className="button-style" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;