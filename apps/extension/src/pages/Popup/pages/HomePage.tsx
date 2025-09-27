import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Notification from '../components/Notification';
import ProductCard from '../components/ProductCard';
import BottomSection from '../components/BottomSection';

interface HomePageProps {
  svgAssets: any;
}

const HomePage: React.FC<HomePageProps> = ({ svgAssets }) => {
  const navigate = useNavigate();

  const handleShowMore = (productId: string) => {
    navigate(`/product/${productId}`);
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
      <Header svgAssets={svgAssets} />
      <Notification svgAssets={svgAssets} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '0 20px',
        flex: 1,
        overflowY: 'auto',
      }}>
        <ProductCard 
          title="White Vest" 
          description="Cotton, medium sized ...." 
          time="00:12" 
          svgAssets={svgAssets}
          onShowMore={() => handleShowMore('white-vest')}
        />
        <ProductCard 
          title="Blue Jeans" 
          description="Denim, size large ...." 
          time="00:15" 
          svgAssets={svgAssets}
          onShowMore={() => handleShowMore('blue-jeans')}
        />
        <ProductCard 
          title="Red Shirt" 
          description="Polyester, small size ...." 
          time="00:18" 
          svgAssets={svgAssets}
          onShowMore={() => handleShowMore('red-shirt')}
        />
      </div>
      <BottomSection svgAssets={svgAssets} />
    </div>
  );
};

export default HomePage;
