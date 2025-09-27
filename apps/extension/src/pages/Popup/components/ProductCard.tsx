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
      borderRadius: '4px',
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
          <div style={{ cursor: 'pointer', width: '18px', height: '16px' }} dangerouslySetInnerHTML={{ __html: svgAssets.vector || '' }} />
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
