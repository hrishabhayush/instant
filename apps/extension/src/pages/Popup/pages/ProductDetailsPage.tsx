import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
        description: 'Premium cotton vest, medium sized. Perfect for casual wear and layering. Made with sustainable materials and ethical manufacturing practices.',
        price: '$24.99',
        source: 'Amazon',
        image: 'Product Image'
      },
      'blue-jeans': {
        title: 'Blue Jeans',
        description: 'Classic denim jeans, size large. Comfortable fit with modern styling. Made from high-quality denim with attention to detail.',
        price: '$49.99',
        source: 'Levi\'s',
        image: 'Product Image'
      },
      'red-shirt': {
        title: 'Red Shirt',
        description: 'Stylish polyester shirt, small size. Perfect for both casual and semi-formal occasions. Easy care and wrinkle-resistant.',
        price: '$19.99',
        source: 'H&M',
        image: 'Product Image'
      }
    };
    return products[id] || products['white-vest'];
  };

  const product = getProductData(productId || 'white-vest');

  const handleBack = () => {
    navigate('/');
  };

  const handlePurchase = () => {
    // In a real app, this would handle the purchase flow
    console.log('Purchase initiated for:', product.title);
  };

  const handleAddToWishlist = () => {
    // In a real app, this would add to wishlist
    console.log('Added to wishlist:', product.title);
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
      {/* Header with back button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <button 
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Product Details</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Product Image */}
      <div style={{
        height: '200px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        margin: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          {product.image}
        </div>
      </div>

      {/* Product Info */}
      <div style={{
        padding: '0 20px',
        flex: 1,
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600, color: 'white' }}>
          {product.title}
        </h2>
        <p style={{ 
          margin: '0 0 16px 0', 
          fontSize: '16px', 
          color: 'rgba(255, 255, 255, 0.7)', 
          lineHeight: 1.5 
        }}>
          {product.description}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 600, color: 'white' }}>
              {product.price}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
              From {product.source}
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
            <div style={{ cursor: 'pointer' }}>
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                <path d="M14.5 1.5C17.5 1.5 20 4 20 7C20 14 10 18 10 18S0 14 0 7C0 4 2.5 1.5 5.5 1.5C7.36 1.5 9 2.64 10 4.34C11 2.64 12.64 1.5 14.5 1.5Z" stroke="white" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div style={{ cursor: 'pointer' }} dangerouslySetInnerHTML={{ __html: svgAssets.msg || '' }} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        padding: '20px',
        flexShrink: 0,
      }}>
        <button 
          onClick={handlePurchase}
          style={{
            width: '100%',
            background: '#4A9EFF',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '12px',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#3A8EEF'}
          onMouseOut={(e) => e.currentTarget.style.background = '#4A9EFF'}
        >
          Purchase Now
        </button>
        <button 
          onClick={handleAddToWishlist}
          style={{
            width: '100%',
            background: 'transparent',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Add to Wishlist
        </button>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
