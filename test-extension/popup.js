// Popup script for Instagram Reels Test Extension

document.addEventListener('DOMContentLoaded', function() {
    console.log("🧪 Popup loaded!")
    
    const statusDiv = document.getElementById('status')
    const imageContainer = document.getElementById('imageContainer')
    const capturedImage = document.getElementById('capturedImage')
    const imageInfo = document.getElementById('imageInfo')
    const testButton = document.getElementById('testButton')
    const clearButton = document.getElementById('clearButton')
    
    // Load last captured image when popup opens
    loadLastCapturedImage()
    
    // Test button - manually test frame capture
    testButton.addEventListener('click', async () => {
        statusDiv.innerHTML = '<p>Testing frame capture...</p>'
        statusDiv.className = 'status'
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            
            if (!tab.url.includes('instagram.com')) {
                statusDiv.innerHTML = '<p>Please go to Instagram first!</p>'
                statusDiv.className = 'status error'
                return
            }
            
            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: "captureReelFrame"
            })
            
            if (response && response.success) {
                displayCapturedImage(response)
                statusDiv.innerHTML = '<p>Frame captured successfully!</p>'
                statusDiv.className = 'status success'
            } else {
                statusDiv.innerHTML = `<p>Capture failed: ${response?.error || 'Unknown error'}</p>`
                statusDiv.className = 'status error'
            }
            
        } catch (error) {
            console.error("Error:", error)
            statusDiv.innerHTML = '<p>Error: Make sure you\'re on Instagram with a reel visible!</p>'
            statusDiv.className = 'status error'
        }
    })
    
    // Clear button
    clearButton.addEventListener('click', () => {
        statusDiv.innerHTML = '<p>Extension loaded. Right-click on an Instagram reel to test!</p>'
        statusDiv.className = 'status'
        imageContainer.style.display = 'none'
        chrome.storage.local.remove(['lastCapturedImage', 'lastDimensions', 'lastVideoInfo', 'timestamp'])
    })
    
    // Load last captured image from storage
    function loadLastCapturedImage() {
        chrome.storage.local.get(['lastCapturedImage', 'lastDimensions', 'timestamp'], (result) => {
            if (result.lastCapturedImage) {
                const timeAgo = new Date() - new Date(result.timestamp)
                const minutesAgo = Math.floor(timeAgo / 60000)
                
                statusDiv.innerHTML = `<p>Last capture: ${minutesAgo} minutes ago</p>`
                statusDiv.className = 'status success'
                
                displayCapturedImage({
                    imageData: result.lastCapturedImage,
                    dimensions: result.lastDimensions || { width: 'Unknown', height: 'Unknown' }
                })
            }
        })
    }
    
    // Display captured image
    function displayCapturedImage(data) {
        capturedImage.src = data.imageData
        imageInfo.textContent = `Dimensions: ${data.dimensions?.width || 'Unknown'} x ${data.dimensions?.height || 'Unknown'}`
        imageContainer.style.display = 'block'
    }
})

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updatePopup") {
        console.log("Popup update received:", request)
        // Refresh the popup content
        location.reload()
    }
})
