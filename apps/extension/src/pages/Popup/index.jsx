import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';

console.log('POPUP SCRIPT STARTING');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing React app...');
  
  const rootElement = document.getElementById('root');
  if (rootElement) {
    console.log('Root element found, creating React root...');
    const root = createRoot(rootElement);
    root.render(<Popup />);
    console.log('React app rendered successfully');
  } else {
    console.error('Root container not found!');
  }
});

console.log('POPUP SCRIPT ENDING');
