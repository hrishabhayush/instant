// Content script for Instagram Reels Test Extension

console.log("🧪 Instagram Reels content script injected!")

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📨 Message received:", request)
    
    if (request.action === "captureReelFrame") {
        console.log("🎬 Capturing Instagram reel frame...")
        console.log("🎯 Target element ID:", request.targetElementId)
        
        const result = captureInstagramReelFrame(request.targetElementId)
        sendResponse(result)
    }
})

// Function to capture Instagram reel frame with dynamic targeting
function captureInstagramReelFrame(targetElementId) {
    try {
        let video = null
        
        // If we have a target element ID, try to find the specific video
        if (targetElementId) {
            console.log("🎯 Looking for video near target element:", targetElementId)
            
            // Method 1: Find video by traversing from the clicked element
            const clickedElement = document.querySelector(`[data-extension-target="${targetElementId}"]`)
            if (clickedElement) {
                // Look for video within or near the clicked element
                video = clickedElement.querySelector('video[playsinline]') || 
                       clickedElement.closest('video[playsinline]') ||
                       clickedElement.parentElement?.querySelector('video[playsinline]')
            }
        }
        
        // Method 2: Find the most visible/active video if target method failed
        if (!video) {
            console.log("🎯 Target method failed, finding most visible video...")
            video = findMostVisibleVideo()
        }
        
        // Method 3: Fallback to first video (original behavior)
        if (!video) {
            console.log("🎯 Using fallback: first video found")
            video = document.querySelector('video[playsinline]')
        }
        
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
            readyState: video.readyState,
            isVisible: isElementVisible(video)
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

// Helper function to find the most visible video
function findMostVisibleVideo() {
    const videos = document.querySelectorAll('video[playsinline]')
    let mostVisible = null
    let maxVisibility = 0
    
    videos.forEach(video => {
        const rect = video.getBoundingClientRect()
        const visibility = calculateVisibility(rect)
        
        console.log(`📹 Video visibility: ${visibility}%`, {
            src: video.src,
            rect: rect
        })
        
        if (visibility > maxVisibility) {
            maxVisibility = visibility
            mostVisible = video
        }
    })
    
    return mostVisible
}

// Helper function to calculate element visibility percentage
function calculateVisibility(rect) {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    
    // Calculate intersection with viewport
    const visibleLeft = Math.max(0, rect.left)
    const visibleTop = Math.max(0, rect.top)
    const visibleRight = Math.min(windowWidth, rect.right)
    const visibleBottom = Math.min(windowHeight, rect.bottom)
    
    // Calculate visible area
    const visibleWidth = Math.max(0, visibleRight - visibleLeft)
    const visibleHeight = Math.max(0, visibleBottom - visibleTop)
    const visibleArea = visibleWidth * visibleHeight
    
    // Calculate total area
    const totalArea = rect.width * rect.height
    
    // Return visibility percentage
    return totalArea > 0 ? (visibleArea / totalArea) * 100 : 0
}

// Helper function to check if element is visible
function isElementVisible(element) {
    const rect = element.getBoundingClientRect()
    const visibility = calculateVisibility(rect)
    return visibility > 50 // Consider visible if > 50% visible
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
