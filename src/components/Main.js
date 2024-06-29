// Main.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Main = ({  }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/main', {
      method: 'GET',
      credentials: 'include'  // Include credentials in the request to maintain the backend's session of user's information for the backend to function
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setUser(data.username)
      } else {
        alert(data.message)
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();

    fetch('http://localhost:8000/logout', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include'  // Include credentials in the request
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(data.message)
          navigate('/login'); // Redirect to login
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className='main'>
      <button className="top-left button-style" onClick={handleLogout}>
        Logout
      </button>
      <br />
      <div>
        <p id="user">Welcome {user}</p>
      </div>
      <br />
      <div className="top-right">
        <button className="button-style" onClick={() => navigate('/PC')}>PC</button>
        <br />
        <button className="button-style" onClick={() => navigate('/guess')}>Who's That Pokemon</button>
        <br />
      </div>
      <br />
      <div className="center">
        <button className="button-style" onClick={() => navigate('/battle')}>Search for wild Pokemon</button>
      </div>
    </div>
  );
};

export default Main;