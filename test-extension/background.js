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
        
        // Send message to content script with specific targeting info
        chrome.tabs.sendMessage(tab.id, { 
            action: "captureReelFrame",
            tabId: tab.id,
            // Pass the specific element that was right-clicked
            targetElementId: info.targetElementId,
            frameId: info.frameId
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError)
                return
            }
            
            if (response && response.success) {
                console.log("✅ Frame captured successfully!")
                console.log("Image data length:", response.imageData.length)
                
                // Store image data temporarily
                chrome.storage.local.set({
                    lastCapturedImage: response.imageData,
                    lastDimensions: response.dimensions,
                    lastVideoInfo: response.videoInfo,
                    timestamp: Date.now(),
                    analysisStatus: 'processing'
                })
                
                // Show notification that analysis is starting
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                    title: 'Primer 2.0',
                    message: 'Analyzing clothing... Please wait.'
                })
                
                // Send image to backend for AI analysis
                analyzeClothingWithAI(response.imageData, response.dimensions, response.videoInfo)
                
            } else {
                console.error("❌ Frame capture failed:", response)
            }
        })
    }
})

// Function to analyze clothing with AI
async function analyzeClothingWithAI(imageData, dimensions, videoInfo) {
    try {
        console.log("🤖 Sending image to AI for clothing analysis...")
        
        const response = await fetch('http://localhost:3001/analyze-clothing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageData: imageData
            })
        })
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const analysisResult = await response.json()
        console.log("✅ AI analysis complete:", analysisResult)
        
        // Store complete results
        chrome.storage.local.set({
            lastCapturedImage: imageData,
            lastDimensions: dimensions,
            lastVideoInfo: videoInfo,
            lastAnalysis: analysisResult,
            timestamp: Date.now(),
            analysisStatus: 'complete'
        })
        
        // Show success notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            title: 'Primer 2.0',
            message: `Found ${analysisResult.items?.length || 0} clothing items! Click extension to see results.`
        })
        
    } catch (error) {
        console.error("❌ AI analysis failed:", error)
        
        // Store error state
        chrome.storage.local.set({
            lastCapturedImage: imageData,
            lastDimensions: dimensions,
            lastVideoInfo: videoInfo,
            analysisError: error.message,
            timestamp: Date.now(),
            analysisStatus: 'error'
        })
        
        // Show error notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            title: 'Primer 2.0',
            message: 'Analysis failed. Click extension for details.'
        })
    }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getLastCapturedImage") {
        chrome.storage.local.get(['lastCapturedImage', 'lastAnalysis', 'analysisStatus', 'analysisError', 'timestamp'], (result) => {
            sendResponse(result)
        })
        return true // Keep message channel open
    }
})
