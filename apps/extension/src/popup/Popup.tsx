import React from 'react';

const Popup: React.FC = () => {
  return (
    <div className="popup-container">
      <div className="header">
        <h1>Primer Extension</h1>
      </div>
      
      <div className="content">
        <div className="counter-section">
          <h2>Hello World!</h2>
          <p>Extension is working!</p>
        </div>
      </div>
    </div>
  );
};

export default Popup;
