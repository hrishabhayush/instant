import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';

interface ProductDetailsPageProps {
  svgAssets: any;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ svgAssets }) => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  // Mock product data with multiple sources for each product type
  const getProductData = (id: string) => {
    const productVariants: { [key: string]: any[] } = {
      'white-vest': [
        {
          title: 'White Vest',
          description: 'Cotton, medium sized ....',
          price: '$17.56',
          source: 'Amazon',
          image: 'Product Image'
        },
        {
          title: 'White Tank Top',
          description: 'Cotton blend, medium ....',
          price: '$22.99',
          source: 'H&M',
          image: 'Product Image'
        },
        {
          title: 'White Vest',
          description: 'Premium cotton, M ....',
          price: '$29.99',
          source: 'Zara',
          image: 'Product Image'
        },
        {
          title: 'White Tank',
          description: 'Organic cotton, M ....',
          price: '$34.99',
          source: 'Everlane',
          image: 'Product Image'
        }
      ],
      'blue-jeans': [
        {
          title: 'Blue Jeans',
          description: 'Denim, size large ....',
          price: '$49.99',
          source: 'Levi\'s',
          image: 'Product Image'
        },
        {
          title: 'Blue Denim',
          description: 'Classic fit, L ....',
          price: '$59.99',
          source: 'Gap',
          image: 'Product Image'
        },
        {
          title: 'Blue Jeans',
          description: 'Slim fit, Large ....',
          price: '$79.99',
          source: 'Uniqlo',
          image: 'Product Image'
        }
      ],
      'red-shirt': [
        {
          title: 'Red Shirt',
          description: 'Polyester, small size ....',
          price: '$19.99',
          source: 'H&M',
          image: 'Product Image'
        },
        {
          title: 'Red Tee',
          description: 'Cotton, S ....',
          price: '$24.99',
          source: 'Target',
          image: 'Product Image'
        },
        {
          title: 'Red Shirt',
          description: 'Premium cotton, S ....',
          price: '$39.99',
          source: 'J.Crew',
          image: 'Product Image'
        }
      ]
    };
    return productVariants[id] || productVariants['white-vest'];
  };

  const productVariants = getProductData(productId || 'white-vest');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentProduct = productVariants[currentIndex];

  // Loading state effect
  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setLoadingStep(prev => prev + 1);
    }, 500);

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      clearInterval(loadingInterval);
    }, 1500);

    return () => {
      clearInterval(loadingInterval);
      clearTimeout(loadingTimeout);
    };
  }, []);

  // Handle scroll to update current index
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const itemWidth = scrollContainerRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  const handlePurchase = () => {
    // In a real app, this would handle the purchase flow
    console.log('Purchase initiated for:', currentProduct.title);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleShare = () => {
    console.log('Shared:', currentProduct.title);
  };

  const handleSave = () => {
    console.log('Saved:', currentProduct.title);
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
      <style>{`
        /* Hide scrollbar for horizontal scroll */
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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
              {isLoading ? 'Searching...' : 'Found it!'}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {isLoading ? '....' : 'Here\'s something similar for you to try!'}
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

      {/* Main Product Area */}
      {isLoading ? (
        <div style={{
          flex: 1,
          margin: '0 20px',
          display: 'flex',
          gap: '16px',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '8px',
        }}>
          <div style={{
            minWidth: 'calc(100% - 8px)',
            height: '100%',
            position: 'relative',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            flexShrink: 0,
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0,0,0,0.1)',
              borderTop: '3px solid #4A9EFF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}></div>
            <div style={{
              color: '#666',
              fontSize: '16px',
              fontWeight: 500,
              textAlign: 'center',
            }}>
              Finding similar products...
            </div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      ) : (
        /* Horizontal Scrollable Product Images */
        <div 
          ref={scrollContainerRef}
          style={{
            flex: 1,
            margin: '0 20px',
            overflowX: 'auto',
            overflowY: 'hidden',
            display: 'flex',
            gap: '16px',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '8px',
          }}
          onScroll={handleScroll}
        >
        {productVariants.map((product, index) => (
          <div
            key={index}
            style={{
              minWidth: 'calc(100% - 8px)',
              height: '100%',
              position: 'relative',
              background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              scrollSnapAlign: 'start',
              flexShrink: 0,
            }}
          >
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
              borderRadius: '8px',
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
        ))}
        </div>
      )}

      {/* Swipe Indicators - Only show when not loading */}
      {!isLoading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 0',
          flexShrink: 0,
        }}>
          {productVariants.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index === currentIndex ? '#4A9EFF' : 'rgba(255, 255, 255, 0.3)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom Action Bar - Only show when not loading */}
      {!isLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          flexShrink: 0,
        }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button 
            onClick={handleBack}
            style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Back
          </button>
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
      )}
    </div>
  );
};

export default ProductDetailsPage;
