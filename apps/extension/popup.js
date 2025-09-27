// Primer 2.0 - Amazon Automation Popup

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Primer 2.0 popup loaded!")
    
    const statusDiv = document.getElementById('status')
    const testButton = document.getElementById('testButton')
    const clearButton = document.getElementById('clearButton')
    
    // Test button - manually test add to cart
    testButton.addEventListener('click', async () => {
        statusDiv.innerHTML = '<p>Testing add to cart...</p>'
        statusDiv.className = 'status'
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            
            if (!tab.url.includes('amazon.com')) {
                statusDiv.innerHTML = '<p>Please go to an Amazon product page first!</p>'
                statusDiv.className = 'status error'
                return
            }
            
            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: "addToCart"
            })
            
            if (response && response.success) {
                statusDiv.innerHTML = '<p>Item added to cart successfully!</p>'
                statusDiv.className = 'status success'
            } else {
                statusDiv.innerHTML = `<p>Add to cart failed: ${response?.error || 'Unknown error'}</p>`
                statusDiv.className = 'status error'
            }
            
        } catch (error) {
            console.error("Error:", error)
            statusDiv.innerHTML = '<p>Error: Make sure you\'re on an Amazon product page!</p>'
            statusDiv.className = 'status error'
        }
    })
    
    // Clear button
    clearButton.addEventListener('click', () => {
        statusDiv.innerHTML = '<p>Primer 2.0 ready! Visit any Amazon product page for automatic add to cart.</p>'
        statusDiv.className = 'status'
    })
    
    // Initial status
    statusDiv.innerHTML = '<p>Primer 2.0 ready! Visit any Amazon product page for automatic add to cart.</p>'
    statusDiv.className = 'status'
})

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updatePopup") {
        console.log("Popup update received:", request)
        // Refresh the popup content
        location.reload()
    }
})
