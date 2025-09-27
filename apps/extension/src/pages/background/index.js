// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details);
  
  // Set default settings
  chrome.storage.sync.set({
    theme: 'light',
    notifications: true,
    autoSave: false
  });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  if (request.action === 'getTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ 
        url: tabs[0]?.url,
        title: tabs[0]?.title 
      });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'updateBadge') {
    chrome.action.setBadgeText({
      text: request.text || '',
      tabId: sender.tab?.id
    });
  }
  
  if (request.action === 'instantCapture') {
    console.log('Instant capture triggered:', request);
    
    // Update badge to show capture
    chrome.action.setBadgeText({
      text: '📸',
      tabId: sender.tab?.id
    });
    
    // Clear badge after 3 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({
        text: '',
        tabId: sender.tab?.id
      });
    }, 3000);
    
    // Store capture data
    chrome.storage.local.set({
      lastCapture: {
        url: request.url,
        timestamp: request.timestamp,
        tabId: sender.tab?.id
      }
    });
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
  }
});

chrome.action.onClicked.addListener((tab) => {
  console.log('Extension clicked:', tab);
});
