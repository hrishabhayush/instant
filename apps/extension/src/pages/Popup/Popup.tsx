import React from 'react';

const Popup: React.FC = () => {
  return (
    <div className="instant-container">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <span className="instant-text">Instant</span>
          <svg className="dropdown-icon" width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="nav-icons">
          <div className="icon-btn">
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
              <path d="M14.5 1.5C17.5 1.5 20 4 20 7C20 14 10 18 10 18S0 14 0 7C0 4 2.5 1.5 5.5 1.5C7.36 1.5 9 2.64 10 4.34C11 2.64 12.64 1.5 14.5 1.5Z" fill="white"/>
            </svg>
          </div>
          <div className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" fill="white"/>
              <path d="M6 9L8 11L14 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" fill="white"/>
              <path d="M10 7V13M7 10H13" stroke="black" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Screen Captured Notification */}
      <div className="notification">
        <div className="notification-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="8" width="20" height="14" rx="3" fill="white"/>
            <rect x="6" y="10" width="16" height="10" rx="2" fill="#000000"/>
            <circle cx="14" cy="15" r="4" fill="white"/>
            <circle cx="14" cy="15" r="2" fill="#000000"/>
            <rect x="10" y="6" width="8" height="2" rx="1" fill="white"/>
          </svg>
        </div>
        <div className="notification-content">
          <h2>Screen Captured!</h2>
          <p>Here are the items we found for you.</p>
        </div>
        <div className="menu-dots">
          <svg width="20" height="4" viewBox="0 0 20 4" fill="none">
            <circle cx="2" cy="2" r="2" fill="white"/>
            <circle cx="10" cy="2" r="2" fill="white"/>
            <circle cx="18" cy="2" r="2" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Product Cards */}
      <div className="products">
        {[1, 2, 3].map((index) => (
          <div key={index} className="product-card">
            <div className="product-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="product-info">
              <h3>White Vest</h3>
              <p>Cotten, medium sized ....</p>
              <div className="card-actions">
                <div className="action-icons">
                  <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                    <path d="M13 1C15.5 1 18 3.5 18 6C18 12 9 16 9 16S0 12 0 6C0 3.5 2.5 1 5 1C6.64 1 8 2.14 9 3.64C10 2.14 11.36 1 13 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  </svg>
                  <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                    <path d="M2 1L8 7L2 13M16 1L10 7L16 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                    <path d="M3 5V3C3 1.89543 3.89543 1 5 1H11C12.1046 1 13 1.89543 13 3V5M3 5H1C0.447715 5 0 5.44772 0 6V18C0 18.5523 0.447715 19 1 19H15C15.5523 19 16 18.5523 16 18V6C16 5.44772 15.5523 5 15 5H13M3 5H13" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </div>
                <button className="show-more-btn">Show More</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Text */}
      <div className="bottom-section">
        <p className="capture-again">
          <span className="instant-brand">Instant</span> Feel free to screen capture again to find better selections!
        </p>
        <p className="brand">Primerpay</p>
      </div>
    </div>
  );
};

export default Popup;
