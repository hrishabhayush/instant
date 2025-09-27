import React from 'react';

interface ProductCardProps {
  title: string;
  description: string;
  time: string;
  svgAssets: any;
  onShowMore?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ title, description, time, svgAssets, onShowMore }) => {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '24px',
      overflow: 'hidden',
      backdropFilter: 'blur(20px)',
      minHeight: '80px',
      padding: '16px 20px',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
        Time: {time}
      </div>
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 600, color: 'white' }}>{title}</h3>
        <p style={{ margin: '0', fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>{description}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ cursor: 'pointer' }}>
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
              <path d="M14.5 1.5C17.5 1.5 20 4 20 7C20 14 10 18 10 18S0 14 0 7C0 4 2.5 1.5 5.5 1.5C7.36 1.5 9 2.64 10 4.34C11 2.64 12.64 1.5 14.5 1.5Z" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div style={{ cursor: 'pointer' }} dangerouslySetInnerHTML={{ __html: svgAssets.ssav || '' }} />
          <div style={{ cursor: 'pointer' }} dangerouslySetInnerHTML={{ __html: svgAssets.msg || '' }} />
        </div>
        <button 
          onClick={onShowMore}
          style={{
            background: '#4A9EFF',
            color: 'white',
            border: 'none',
            padding: '8px 32px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            minWidth: '120px',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#3A8EEF'}
          onMouseOut={(e) => e.currentTarget.style.background = '#4A9EFF'}
        >Show More</button>
      </div>
    </div>
  );
};

export default ProductCard;
