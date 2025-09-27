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
        <div style={{ width: '18px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <div dangerouslySetInnerHTML={{ __html: svgAssets.vector || '' }} />
        </div>
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
