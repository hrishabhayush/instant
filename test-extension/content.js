// Content script for Instagram Reels Test Extension

console.log("🧪 Instagram Reels content script injected!")

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📨 Message received:", request)
    
    if (request.action === "captureReelFrame") {
        console.log("🎬 Capturing Instagram reel frame...")
        
        const result = captureInstagramReelFrame()
        sendResponse(result)
    }
})

// Function to capture Instagram reel frame
function captureInstagramReelFrame() {
    try {
        // Find Instagram video element
        const video = document.querySelector('video[playsinline]')
        
        if (!video) {
            console.log("❌ No Instagram video found")
            return { 
                success: false, 
                error: "No Instagram video found" 
            }
        }
        
        console.log("✅ Instagram video found:", {
            src: video.src,
            dimensions: `${video.videoWidth}x${video.videoHeight}`,
            readyState: video.readyState
        })
        
        // Create canvas to capture video frame
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Set canvas size to video size
        canvas.width = video.videoWidth || 400
        canvas.height = video.videoHeight || 600
        
        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to image data
        const imageData = canvas.toDataURL('image/png')
        
        console.log("✅ Frame captured successfully!")
        console.log("Image data length:", imageData.length)
        
        return {
            success: true,
            imageData: imageData,
            dimensions: {
                width: canvas.width,
                height: canvas.height
            },
            videoInfo: {
                src: video.src,
                currentTime: video.currentTime,
                duration: video.duration
            }
        }
        
    } catch (error) {
        console.error("❌ Error capturing frame:", error)
        return {
            success: false,
            error: error.message
        }
    }
}

// Test function to verify content script is working
function testContentScript() {
    console.log("🧪 Testing content script functionality...")
    
    const video = document.querySelector('video[playsinline]')
    if (video) {
        console.log("✅ Content script working - video found")
        return true
    } else {
        console.log("❌ Content script working but no video found")
        return false
    }
}

// Run test when script loads
testContentScript()
