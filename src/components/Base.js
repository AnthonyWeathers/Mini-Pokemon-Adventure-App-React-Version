// Base.js
import React from 'react';
// import { FlashMessages } from './FlashMessages'; // You'll need to create FlashMessages component
import '../static/site.css'; // Import your CSS file here

const Base = ({ children }) => {
  return (
    <html>
      <head>
        <title>Mini Pokemon Adventure</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x"
          crossorigin="anonymous"
        />
      </head>
      <body>
        <div className="container">
          <FlashMessages /> {/* Component to display flash messages */}
          <div className="block-container">{children}</div>
        </div>
      </body>
    </html>
  );
};

export default Base;