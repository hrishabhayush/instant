// Background script for Instagram Reels Test Extension

console.log("🧪 Instagram Reels Test Extension loaded!")

// Create context menu when extension installs
chrome.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed:", details.reason)
    
    // Create context menu for videos and all contexts
    chrome.contextMenus.create({
        id: "findSimilarProducts",
        title: "Find Similar Products",
        contexts: ["video", "page"],
        documentUrlPatterns: ["https://www.instagram.com/*"]
    })
    
    console.log("✅ Context menu created for Instagram videos!")
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log("🧪 Context menu clicked!", info)
    
    if (info.menuItemId === "findSimilarProducts") {
        console.log("User wants to find similar products!")
        
        // Check if we're on Instagram
        if (!tab.url.includes('instagram.com')) {
            console.log("❌ Not on Instagram")
            return
        }
        
        // Send message to content script to capture video frame
        chrome.tabs.sendMessage(tab.id, { 
            action: "captureReelFrame",
            tabId: tab.id 
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError)
                return
            }
            
            if (response && response.success) {
                console.log("✅ Frame captured successfully!")
                console.log("Image data length:", response.imageData.length)
                
                // Store image data for popup to access
                chrome.storage.local.set({
                    lastCapturedImage: response.imageData,
                    lastDimensions: response.dimensions,
                    lastVideoInfo: response.videoInfo,
                    timestamp: Date.now()
                })
                
                // Show notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                    title: 'Instagram Reels Test',
                    message: 'Frame captured! Click extension icon to see results.'
                })
                
            } else {
                console.error("❌ Frame capture failed:", response)
            }
        })
    }
})

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getLastCapturedImage") {
        chrome.storage.local.get(['lastCapturedImage', 'timestamp'], (result) => {
            sendResponse(result)
        })
        return true // Keep message channel open
    }
})
