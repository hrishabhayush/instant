// Content script for Chrome Extension
console.log('Primer Extension content script loaded');

// Create a simple overlay to show extension is active
const createOverlay = () => {
  const overlay = document.createElement('div');
  overlay.id = 'primer-extension-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    font-size: 12px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  overlay.textContent = 'Primer Active';
  
  // Add hover effect
  overlay.addEventListener('mouseenter', () => {
    overlay.style.transform = 'scale(1.05)';
  });
  
  overlay.addEventListener('mouseleave', () => {
    overlay.style.transform = 'scale(1)';
  });
  
  // Click to send message to background
  overlay.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: 'updateBadge',
      text: '✓'
    });
    
    overlay.textContent = 'Primer Clicked!';
    setTimeout(() => {
      overlay.textContent = 'Primer Active';
    }, 2000);
  });
  
  document.body.appendChild(overlay);
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createOverlay);
} else {
  createOverlay();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    sendResponse({
      title: document.title,
      url: window.location.href,
      domain: window.location.hostname
    });
  }
});
