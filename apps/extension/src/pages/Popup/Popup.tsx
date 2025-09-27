import React, { useState, useEffect } from 'react';

interface CapturedImage {
  imageData: string;
  dimensions: {
    width: number | string;
    height: number | string;
  };
}

const Popup: React.FC = () => {
  const [status, setStatus] = useState<string>('Extension loaded. Right-click on an Instagram reel to test!');
  const [statusClass, setStatusClass] = useState<string>('status');
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadLastCapturedImage();
  }, []);

  const loadLastCapturedImage = () => {
    chrome.storage.local.get(['lastCapturedImage', 'lastDimensions', 'timestamp'], (result) => {
      if (result.lastCapturedImage) {
        const timeAgo = new Date().getTime() - new Date(result.timestamp).getTime();
        const minutesAgo = Math.floor(timeAgo / 60000);
        
        setStatus(`Last capture: ${minutesAgo} minutes ago`);
        setStatusClass('status success');
        
        setCapturedImage({
          imageData: result.lastCapturedImage,
          dimensions: result.lastDimensions || { width: 'Unknown', height: 'Unknown' }
        });
      }
    });
  };

  const testFrameCapture = async () => {
    setIsLoading(true);
    setStatus('Testing frame capture...');
    setStatusClass('status');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url?.includes('instagram.com')) {
        setStatus('Please go to Instagram first!');
        setStatusClass('status error');
        setIsLoading(false);
        return;
      }
      
      if (!tab.id) {
        setStatus('No active tab found');
        setStatusClass('status error');
        setIsLoading(false);
        return;
      }
      
      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "captureReelFrame"
      });
      
      if (response && response.success) {
        setCapturedImage({
          imageData: response.imageData,
          dimensions: response.dimensions
        });
        setStatus('Frame captured successfully!');
        setStatusClass('status success');
      } else {
        setStatus(`Capture failed: ${response?.error || 'Unknown error'}`);
        setStatusClass('status error');
      }
      
    } catch (error) {
      console.error("Error:", error);
      setStatus('Error: Make sure you\'re on Instagram with a reel visible!');
      setStatusClass('status error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setStatus('Extension loaded. Right-click on an Instagram reel to test!');
    setStatusClass('status');
    setCapturedImage(null);
    chrome.storage.local.remove(['lastCapturedImage', 'lastDimensions', 'lastVideoInfo', 'timestamp']);
  };

  const displayCapturedImage = (data: CapturedImage) => {
    setCapturedImage(data);
  };

  return (
    <div className="popup-container">
      <div className="header">
        <h1>Instagram Reels Test</h1>
      </div>
      
      <div id="status" className={statusClass}>
        <p>{status}</p>
      </div>
      
      {capturedImage && (
        <div id="imageContainer" style={{ display: 'block' }}>
          <h3>Captured Frame:</h3>
          <img 
            src={capturedImage.imageData} 
            alt="Captured frame" 
            className="image-preview"
          />
          <div className="info">
            Dimensions: {capturedImage.dimensions?.width || 'Unknown'} x {capturedImage.dimensions?.height || 'Unknown'}
          </div>
        </div>
      )}
      
      <button 
        id="testButton" 
        className="button"
        onClick={testFrameCapture}
        disabled={isLoading}
      >
        {isLoading ? 'Capturing...' : 'Test Frame Capture'}
      </button>
      
      <button 
        id="clearButton" 
        className="button"
        onClick={clearResults}
      >
        Clear Results
      </button>
    </div>
  );
};

export default Popup;