// Register.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const payload = { name, username, password };
    console.log('Register payload:', payload);
    fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(data.message)
          navigate('/login'); // Redirect to login
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
      <h2 id="sign-in">Registering a new account to begin your Pokemon journey</h2>
      <form id="form" onSubmit={handleRegister}>
        <div id="form-piece">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
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
        <button className="button-style" type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;