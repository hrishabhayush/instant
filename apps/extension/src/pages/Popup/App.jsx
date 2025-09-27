import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SettingsPage from './pages/SettingsPage';

// Function to load SVG content from file
async function loadSVG(path) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const url = chrome.runtime.getURL(path);
      console.log('Loading SVG from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to load SVG:', path, 'Status:', response.status);
        return '';
      }
      const content = await response.text();
      console.log('Successfully loaded SVG:', path, 'Length:', content.length);
      return content;
    } else {
      console.warn('Chrome runtime not available for:', path);
      return '';
    }
  } catch (error) {
    console.error('Error loading SVG:', path, error);
    return '';
  }
}

const App = () => {
  console.log('App component is rendering');
  const [svgAssets, setSvgAssets] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;

    const loadAssets = async () => {
      console.log('Loading SVG assets...');
      
      try {
        const assets = {
          dropdown: await loadSVG('src/assets/sources/svgs/Icons.svg'),
          message: await loadSVG('src/assets/sources/svgs/Icons-1.svg'),
          add: await loadSVG('src/assets/sources/svgs/Icons-2.svg'),
          instant: await loadSVG('src/assets/sources/svgs/Instant.svg'),
          avatar: await loadSVG('src/assets/sources/svgs/Avatar.svg'),
          question: await loadSVG('src/assets/sources/svgs/fluent_tag-question-mark-32-regular.svg'),
          msg: await loadSVG('src/assets/sources/svgs/msg.svg'),
          ssav: await loadSVG('src/assets/sources/svgs/ssav.svg'),
          vector: await loadSVG('src/assets/sources/svgs/Vector.svg')
        };
        
        if (isMounted && !hasLoaded) {
          hasLoaded = true;
          console.log('SVG assets loaded:', Object.keys(assets));
          console.log('Sample asset content:', assets.instant ? 'instant loaded' : 'instant failed');
          setSvgAssets(assets);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading assets:', error);
        if (isMounted && !hasLoaded) {
          hasLoaded = true;
          // Set empty assets object and continue
          setSvgAssets({});
          setIsLoading(false);
        }
      }
    };

    loadAssets();
    
    // Fallback timeout in case loading takes too long
    const timeout = setTimeout(() => {
      if (isMounted && !hasLoaded) {
        hasLoaded = true;
        console.warn('SVG loading timeout, proceeding without assets');
        setSvgAssets({});
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{
        width: '375px',
        height: '600px',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid #4A9EFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div>Loading...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage svgAssets={svgAssets} />} />
        <Route path="/product/:productId" element={<ProductDetailsPage svgAssets={svgAssets} />} />
        <Route path="/settings" element={<SettingsPage svgAssets={svgAssets} />} />
      </Routes>
    </Router>
  );
};

export default App;
