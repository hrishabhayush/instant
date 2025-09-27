import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';

interface ProductDetailsPageProps {
  svgAssets: any;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ svgAssets }) => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  // Mock product data - in a real app, this would come from state or API
  const getProductData = (id: string) => {
    const products: { [key: string]: any } = {
      'white-vest': {
        title: 'White Vest',
        description: 'Cotton, medium sized ....',
        price: '$17.56',
        source: 'Amazon',
        image: 'Product Image'
      },
      'blue-jeans': {
        title: 'Blue Jeans',
        description: 'Denim, size large ....',
        price: '$49.99',
        source: 'Levi\'s',
        image: 'Product Image'
      },
      'red-shirt': {
        title: 'Red Shirt',
        description: 'Polyester, small size ....',
        price: '$19.99',
        source: 'H&M',
        image: 'Product Image'
      }
    };
    return products[id] || products['white-vest'];
  };

  const product = getProductData(productId || 'white-vest');

  const handlePurchase = () => {
    // In a real app, this would handle the purchase flow
    console.log('Purchase initiated for:', product.title);
  };

  const handleLike = () => {
    console.log('Liked:', product.title);
  };

  const handleShare = () => {
    console.log('Shared:', product.title);
  };

  const handleSave = () => {
    console.log('Saved:', product.title);
  };

  return (
    <div style={{
      width: '375px', 
      height: '600px', 
      background: '#000000', 
      color: 'white', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Header svgAssets={svgAssets} />

      {/* Product/User Info Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ width: '40px', height: '40px' }} dangerouslySetInnerHTML={{ __html: svgAssets.avatar || '' }} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>
              {product.title}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Here's something similar for you to try!
            </div>
          </div>
        </div>
        <div style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="19" cy="12" r="1"/>
            <circle cx="5" cy="12" r="1"/>
          </svg>
        </div>
      </div>

      {/* Main Product Image */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
        margin: '0 20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Placeholder for product image */}
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '16px',
          fontWeight: 500,
        }}>
          Product Image
        </div>
        
        {/* Product Info Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          <div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: 'white',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              marginBottom: '4px'
            }}>
              {product.title}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: 'rgba(255, 255, 255, 0.8)',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}>
              {product.description}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: 'white',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              marginBottom: '4px'
            }}>
              {product.price}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: 'rgba(255, 255, 255, 0.8)',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}>
              From {product.source}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div 
            onClick={handleLike}
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
            }}
          >
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M14.5 1.5C17.5 1.5 20 4 20 7C20 14 10 18 10 18S0 14 0 7C0 4 2.5 1.5 5.5 1.5C7.36 1.5 9 2.64 10 4.34C11 2.64 12.64 1.5 14.5 1.5Z"/>
            </svg>
          </div>
          <div 
            onClick={handleShare}
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9 22,2"/>
            </svg>
          </div>
          <div 
            onClick={handleSave}
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </div>
        
        <button 
          onClick={handlePurchase}
          style={{
            background: '#4A9EFF',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#3A8EEF'}
          onMouseOut={(e) => e.currentTarget.style.background = '#4A9EFF'}
        >
          Purchase
        </button>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
