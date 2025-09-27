import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  svgAssets: any;
}

const Header: React.FC<HeaderProps> = ({ svgAssets }) => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ height: '25px' }} dangerouslySetInnerHTML={{ __html: svgAssets.instant || '' }} />
        <div style={{ width: '12px', height: '8px', marginTop: '-12px' }} dangerouslySetInnerHTML={{ __html: svgAssets.dropdown || '' }} />
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
            <path d="M14.5 1.5C17.5 1.5 20 4 20 7C20 14 10 18 10 18S0 14 0 7C0 4 2.5 1.5 5.5 1.5C7.36 1.5 9 2.64 10 4.34C11 2.64 12.64 1.5 14.5 1.5Z" stroke="white" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} dangerouslySetInnerHTML={{ __html: svgAssets.message || '' }} />
        <div 
          onClick={handleSettingsClick}
          style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} 
          dangerouslySetInnerHTML={{ __html: svgAssets.add || '' }} 
        />
      </div>
    </div>
  );
};

export default Header;
