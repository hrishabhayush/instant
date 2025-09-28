// Popup script for Instagram Reels Test Extension

// Function to open product links (Chrome extension compatible)
window.openProductLink = function(url) {
    console.log('Opening product link:', url);
    if (url && url !== 'undefined' && url !== 'null') {
        try {
            // Use chrome.tabs API for better compatibility
            chrome.tabs.create({ url: url });
        } catch (error) {
            console.error('Error opening link:', error);
            // Fallback to window.open
            window.open(url, '_blank');
        }
    } else {
        console.error('No valid URL provided:', url);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("🧪 Popup loaded!")
    
    // Clear extension badge when popup opens
    chrome.action.setBadgeText({ text: "" })
    
    const statusDiv = document.getElementById('status')
    const imageContainer = document.getElementById('imageContainer')
    const capturedImage = document.getElementById('capturedImage')
    const imageInfo = document.getElementById('imageInfo')
    const testButton = document.getElementById('testButton')
    const clearButton = document.getElementById('clearButton')
    
    // Load last captured image when popup opens
    loadLastCapturedImage()
    
    // Check if we have stored product results to restore
    restoreProductResults()
    
    // Function to restore product results from storage
    async function restoreProductResults() {
        try {
            const result = await chrome.storage.local.get(['lastProductResults'])
            if (result.lastProductResults) {
                const storedData = result.lastProductResults
                console.log('🔄 Restoring product results from storage:', storedData)
                
                // Check if results are recent (less than 1 hour old)
                const now = Date.now()
                const oneHour = 60 * 60 * 1000
                if (now - storedData.timestamp < oneHour) {
                    console.log('✅ Restoring recent product results')
                    
                    // Show the product results screen
                    displaySimilarProducts(storedData.bestMatch, storedData.alternatives, storedData.selectedItem)
                } else {
                    console.log('⏰ Stored results are too old, clearing them')
                    chrome.storage.local.remove(['lastProductResults'])
                }
            }
        } catch (error) {
            console.error('Error restoring product results:', error)
        }
    }
    
    // Test button - manually test frame capture
    testButton.addEventListener('click', async () => {
        // Clear any stored results when starting a new search
        chrome.storage.local.remove(['lastProductResults'])
        
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
        hideAllAnalysisStates()
        chrome.storage.local.remove(['lastCapturedImage', 'lastDimensions', 'lastVideoInfo', 'lastAnalysis', 'analysisStatus', 'analysisError', 'timestamp', 'lastProductResults'])
    })
    
    // Load last captured image from storage
    function loadLastCapturedImage() {
        chrome.storage.local.get(['lastCapturedImage', 'lastDimensions', 'lastAnalysis', 'analysisStatus', 'analysisError', 'timestamp', 'lastProductResults'], (result) => {
            if (result.lastCapturedImage) {
                const timeAgo = new Date() - new Date(result.timestamp)
                const minutesAgo = Math.floor(timeAgo / 60000)
                
                statusDiv.innerHTML = `<p>Last capture: ${minutesAgo} minutes ago</p>`
                statusDiv.className = 'status success'
                
                displayCapturedImage({
                    imageData: result.lastCapturedImage,
                    dimensions: result.lastDimensions || { width: 'Unknown', height: 'Unknown' }
                })
                
                // Display analysis results based on status
                if (result.analysisStatus === 'processing') {
                    showLoadingState()
                } else if (result.analysisStatus === 'complete' && result.lastAnalysis) {
                    // Check if we have product results to show instead of analysis
                    if (result.lastProductResults && result.lastProductResults.timestamp > (result.timestamp || 0)) {
                        console.log('Restoring last product results')
                        displaySimilarProducts(result.lastProductResults.bestMatch, result.lastProductResults.alternatives, result.lastProductResults.selectedItem)
                    } else {
                        showAnalysisResults(result.lastAnalysis)
                    }
                } else if (result.analysisStatus === 'error') {
                    showErrorState(result.analysisError)
                }
            }
        })
    }
    
    // Display captured image
    function displayCapturedImage(data) {
        capturedImage.src = data.imageData
        imageInfo.textContent = `Dimensions: ${data.dimensions?.width || 'Unknown'} x ${data.dimensions?.height || 'Unknown'}`
        imageContainer.style.display = 'block'
    }
    
    // Show loading state while AI processes
    function showLoadingState() {
        hideAllAnalysisStates()
        document.getElementById('loadingContainer').style.display = 'block'
    }
    
    // Show AI analysis results as clothing menu
    function showAnalysisResults(analysis) {
        hideAllAnalysisStates()
        
        const analysisContainer = document.getElementById('analysisContainer')
        const clothingMenu = document.getElementById('clothingMenu')
        
        if (analysis.success && analysis.items && analysis.items.length > 0) {
            // Clear any stored product results when showing new clothing items
            chrome.storage.local.remove(['lastProductResults'])
            
            clothingMenu.innerHTML = ''
            
            analysis.items.forEach((item, index) => {
                const optionDiv = document.createElement('div')
                optionDiv.className = 'clothing-option'
                optionDiv.onclick = () => selectClothingItem(item)
                
                optionDiv.innerHTML = `
                    <h4>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</h4>
                    <div class="clothing-description">${item.description}</div>
                `
                
                clothingMenu.appendChild(optionDiv)
            })
            
            analysisContainer.style.display = 'block'
        } else {
            clothingMenu.innerHTML = '<p>No clothing items detected in the image.</p>'
            analysisContainer.style.display = 'block'
        }
    }
    
    // Handle clothing item selection
    async function selectClothingItem(item) {
        console.log('Selected clothing item:', item)
        
        // Store selected item
        chrome.storage.local.set({
            selectedClothingItem: item,
            timestamp: Date.now()
        })
        
        // Show loading state while searching for products
        const clothingMenu = document.getElementById('clothingMenu')
        clothingMenu.innerHTML = `
            <div class="selected-item">
                <h4>✅ Selected: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</h4>
                <p>${item.description}</p>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">
                    🔍 Finding similar products...
                </p>
            </div>
        `
        
        // Get the captured reel image data for product search
        chrome.storage.local.get(['lastCapturedImage'], async (result) => {
            if (!result.lastCapturedImage) {
                clothingMenu.innerHTML = `
                    <div class="error">
                        <h4>❌ Error</h4>
                        <p>No captured image found. Please try again.</p>
                    </div>
                `
                return
            }
            
            try {
                // Call backend to search for similar products
                const response = await fetch('http://localhost:3001/search-similar-products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        reelImageData: result.lastCapturedImage,
                        selectedClothingItem: item
                    })
                })
                
                const searchResult = await response.json()
                console.log('🔍 Search result received:', searchResult)
                console.log('🔍 Best match:', searchResult.bestMatch)
                console.log('🔍 Similar products:', searchResult.similarProducts)
                console.log('🔍 Alternatives:', searchResult.alternatives)
                
                if (searchResult.success && (searchResult.bestMatch || searchResult.similarProducts || searchResult.alternatives)) {
                    // Display best match + similar products
                    const productsToShow = searchResult.similarProducts || searchResult.alternatives || []
                    console.log('🔍 Products to display:', productsToShow)
                    displaySimilarProducts(searchResult.bestMatch, productsToShow, item)
                } else {
                    clothingMenu.innerHTML = `
                        <div class="error">
                            <h4>❌ No Similar Products Found</h4>
                            <p>Could not find similar products for this item.</p>
                        </div>
                    `
                }
                
            } catch (error) {
                console.error('Error searching for products:', error)
                clothingMenu.innerHTML = `
                    <div class="error">
                        <h4>❌ Search Failed</h4>
                        <p>Error finding similar products: ${error.message}</p>
                    </div>
                `
            }
        })
    }
    
    // Display similar products found
    function displaySimilarProducts(bestMatch, alternatives, selectedItem) {
        const clothingMenu = document.getElementById('clothingMenu')
        
        let productsHtml = `
            <div style="margin-bottom: 20px; text-align: center;">
                <button id="backToSearchBtn" style="
                    background: #6c757d; 
                    color: white; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 6px; 
                    font-size: 12px; 
                    cursor: pointer;
                    margin-bottom: 10px;
                " onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">
                    ← Back to Clothing Selection
                </button>
                <h3 style="margin: 0 0 5px 0; color: #333; font-weight: 600;">Items Found</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">I found some products for you to try!</p>
            </div>
        `
        
        // Combine best match and alternatives into one array
        const allProducts = []
        if (bestMatch) {
            allProducts.push({...bestMatch, isBestMatch: true})
        }
        if (alternatives) {
            allProducts.push(...alternatives.map(p => ({...p, isBestMatch: false})))
        }
        
        allProducts.forEach((product, index) => {
            console.log('🔍 Raw product data:', product)
            console.log('🔍 Product link:', product.link, 'Type:', typeof product.link)
            console.log('🔍 Product link length:', product.link ? product.link.length : 'null')
            console.log('🔍 Product link starts with:', product.link ? product.link.substring(0, 50) : 'null')
            
            // Defensive programming - ensure all required fields exist
            const safeProduct = {
                name: product.name || 'Unknown Product',
                price: product.price || 'Price not available',
                imageUrl: product.imageUrl || product.image || 'https://via.placeholder.com/300x200?text=No+Image',
                link: product.link || null, // Don't default to '#', keep it null so we can detect missing links
                source: product.source || 'Unknown Store',
                description: product.description || 'No description available',
                similarity: product.similarity || 0.7,
                isBestMatch: product.isBestMatch || false
            };
            
            console.log('🔍 Safe product link:', safeProduct.link)
            
            const similarityPercent = Math.round(safeProduct.similarity * 100)
            productsHtml += `
                <div class="product-card" style="
                    background: #fff; 
                    border-radius: 12px; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
                    margin: 16px 0; 
                    overflow: hidden;
                    position: relative;
                ">
                    <!-- Product Image -->
                    <div style="position: relative; width: 100%; height: 200px; background: #f8f9fa;">
                        <img src="${safeProduct.imageUrl}" style="
                            width: 100%; 
                            height: 100%; 
                            object-fit: cover;
                        " alt="${safeProduct.name}">
                        
                        <!-- Similarity Badge -->
                        <div style="
                            position: absolute; 
                            top: 12px; 
                            right: 12px; 
                            background: ${safeProduct.isBestMatch ? 'rgba(255, 193, 7, 0.9)' : 'rgba(40, 167, 69, 0.9)'}; 
                            color: white; 
                            padding: 4px 8px; 
                            border-radius: 12px; 
                            font-size: 11px; 
                            font-weight: 600;
                        ">${safeProduct.isBestMatch ? 'BEST MATCH' : similarityPercent + '% match'}</div>
                    </div>
                    
                    <!-- Product Info -->
                    <div style="padding: 16px;">
                        <!-- Product Name -->
                        <h4 style="
                            margin: 0 0 8px 0; 
                            font-size: 18px; 
                            font-weight: 600; 
                            color: #333;
                            line-height: 1.3;
                        ">${safeProduct.name}</h4>
                        
                        <!-- Description -->
                        <p style="
                            margin: 0 0 12px 0; 
                            font-size: 14px; 
                            color: #666; 
                            line-height: 1.4;
                        ">${safeProduct.description}</p>
                        
                        <!-- Bottom Row: Price, Source, Purchase Button -->
                        <div style="
                            display: flex; 
                            align-items: center; 
                            justify-content: space-between;
                            margin-top: 16px;
                        ">
                            <div style="flex: 1;">
                                <div style="
                                    font-size: 20px; 
                                    font-weight: 700; 
                                    color: #333;
                                    margin-bottom: 2px;
                                ">${safeProduct.price}</div>
                                <div style="
                                    font-size: 12px; 
                                    color: #888;
                                ">From ${safeProduct.source}</div>
                            </div>
                            
                            <!-- Purchase Button -->
                            <button style="
                                background: #007bff; 
                                color: white; 
                                border: none; 
                                padding: 10px 20px; 
                                border-radius: 8px; 
                                font-size: 14px; 
                                font-weight: 600;
                                cursor: pointer;
                                transition: background 0.2s;
                            " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'" data-product-link="${safeProduct.link}">
                                Purchase
                            </button>
                        </div>
                    </div>
                </div>
            `
        })
        
        clothingMenu.innerHTML = productsHtml
        
        // Add event listener for back button
        const backButton = document.getElementById('backToSearchBtn')
        if (backButton) {
            backButton.addEventListener('click', function() {
                console.log('Back to search clicked')
                // Clear stored results and reload the popup
                chrome.storage.local.remove(['lastProductResults'])
                location.reload()
            })
        }
        
        // Store the final results for persistence
        chrome.storage.local.set({
            lastProductResults: {
                bestMatch: bestMatch,
                alternatives: alternatives,
                selectedItem: selectedItem,
                timestamp: Date.now()
            }
        })
        
        // Add event listeners to purchase buttons
        const purchaseButtons = clothingMenu.querySelectorAll('[data-product-link]')
        purchaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const link = this.getAttribute('data-product-link')
                console.log('Purchase button clicked, link:', link)
                console.log('Link type:', typeof link)
                console.log('Link length:', link ? link.length : 'null')
                
                if (link && link !== '#' && link !== 'undefined' && link !== 'null' && link !== null && !link.startsWith('chrome-extension://')) {
                    window.openProductLink(link)
                } else {
                    console.error('Invalid or missing product link:', link)
                    alert(`Product link not available: ${link}. Please try again.`)
                }
            })
        })
    }
    
    // Show error state
    function showErrorState(errorMessage) {
        hideAllAnalysisStates()
        
        const errorContainer = document.getElementById('errorContainer')
        const errorMessageEl = document.getElementById('errorMessage')
        
        errorMessageEl.textContent = errorMessage || 'Unknown error occurred'
        errorContainer.style.display = 'block'
    }
    
    // Hide all analysis states
    function hideAllAnalysisStates() {
        document.getElementById('analysisContainer').style.display = 'none'
        document.getElementById('loadingContainer').style.display = 'none'
        document.getElementById('errorContainer').style.display = 'none'
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
