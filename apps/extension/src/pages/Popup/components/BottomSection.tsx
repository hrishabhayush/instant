import React from 'react';

interface BottomSectionProps {
  svgAssets: any;
}

const BottomSection: React.FC<BottomSectionProps> = ({ svgAssets }) => {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'left',
      flexShrink: 0,
      marginTop: 'auto',
      position: 'relative',
    }}>
      <p style={{
        margin: '0 0 12px 0',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 1.4,
      }}>
        <span style={{ fontWeight: 600, color: 'white' }}>Instant</span> Feel free to screen capture again to find better selections!
      </p>
      <p style={{
        margin: '0',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.5)',
      }}>
        Primerpay
      </p>
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '17px',
        height: '17px',
      }} dangerouslySetInnerHTML={{ __html: svgAssets.question || '' }} />
    </div>
  );
};

export default BottomSection;
