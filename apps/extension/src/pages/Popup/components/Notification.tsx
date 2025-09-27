import React from 'react';

interface NotificationProps {
  svgAssets: any;
}

const Notification: React.FC<NotificationProps> = ({ svgAssets }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '20px',
      flexShrink: 0,
    }}>
      <div style={{
        flexShrink: 0,
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }} dangerouslySetInnerHTML={{ __html: svgAssets.avatar || '' }} />
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600, color: 'white' }}>Screen Captured!</h2>
        <p style={{ margin: '0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Here are the items I found for you.</p>
      </div>
      <div style={{ marginTop: '8px', cursor: 'pointer' }}>
        <svg width="20" height="4" viewBox="0 0 20 4" fill="none">
          <circle cx="2" cy="2" r="2" fill="white"/>
          <circle cx="10" cy="2" r="2" fill="white"/>
          <circle cx="18" cy="2" r="2" fill="white"/>
        </svg>
      </div>
    </div>
  );
};

export default Notification;
