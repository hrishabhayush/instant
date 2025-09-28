// Primer 2.0 - Combined Amazon & Instagram Extension

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
    console.log("🚀 Instant popup loaded!")
    
    // Clear extension badge when popup opens
    chrome.action.setBadgeText({ text: "" })
    
    // Create the UI elements dynamically
    createUI()
    
    const statusDiv = document.getElementById('status')
    const imageContainer = document.getElementById('imageContainer')
    const capturedImage = document.getElementById('capturedImage')
    const imageInfo = document.getElementById('imageInfo')
    const testButton = document.getElementById('testButton')
    const clearButton = document.getElementById('clearButton')
    
    // Function to create the UI elements
    function createUI() {
        const root = document.getElementById('root')
        if (!root) return
        
        root.innerHTML = `
            <div class="app-container">
                <div class="main-content">
                    <div class="instant-logo-section">
                        <img src="src/assets/Instant.svg" alt="Instant" style="height: 35px; width: auto;">
                        <div class="instant-actions">
                            <img src="src/assets/msg.svg" alt="Message" style="width: 20px; height: 20px; margin-right: 8px;">
                            <img src="src/assets/ssav.svg" alt="Save" style="width: 20px; height: 20px;">
                        </div>
                    </div>
                    <div class="avatar-section">
                        <div class="avatar-icon">
                            <img src="src/assets/Avatar.svg" alt="Avatar" style="width: 48px; height: 48px;">
                        </div>
                        <div class="avatar-text">
                            <h3>Screen Captured!</h3>
                            <p>Here are the items we found for you.</p>
                        </div>
                        <div class="avatar-ellipsis">
                            <span style="font-size: 24px; color: white; font-weight: bold;">...</span>
                        </div>
                    </div>
                    <div id="status" class="status-card">
                        <div class="status-icon">
                            <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_209_1630)">
                                    <path d="M7.03658 7.66244L2.61001 2.92118L15.2473 2.92087L7.03658 7.66244ZM9.59341 15.0168L7.70211 8.81516L15.9119 4.07408L9.59341 15.0168Z" stroke="white" stroke-width="1.33125" stroke-linejoin="round"/>
                                </g>
                                <defs>
                                    <clipPath id="clip0_209_1630">
                                        <rect width="17.75" height="17.75" fill="white" transform="translate(0.625)"/>
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        <div class="status-content">
                            <h3>Ready to Shop</h3>
                            <p>Visit any Amazon product page for automatic add to cart.</p>
                        </div>
                    </div>
                    
                    <div id="imageContainer" class="image-section" style="display: none;">
                        <div class="section-header">
                            <h3>Captured Frame</h3>
                        </div>
                        <div class="image-wrapper">
                            <img id="capturedImage" class="captured-image" />
                            <div id="imageInfo" class="image-info"></div>
                        </div>
                        
                        
                        <div id="loadingContainer" class="loading-section" style="display: none;">
                            <div class="loading-spinner"></div>
                            <p class="loading-text">🤖 Analyzing clothing with AI...</p>
                        </div>
                        
                        <div id="errorContainer" class="error-section" style="display: none;">
                            <div class="error-icon">❌</div>
                            <p class="error-text">Analysis failed</p>
                            <p id="errorMessage" class="error-details"></p>
                        </div>
                    </div>
                    
                </div>
            </div>
        `
        
        // Add the CSS styles
        const style = document.createElement('style')
        style.textContent = `
            * {
                box-sizing: border-box;
            }
            
            .app-container {
                display: flex;
                flex-direction: column;
                height: 100vh;
                background: #000000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px 20px;
                background: rgba(0, 0, 0, 0.2);
            }
            
            .logo-section {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .avatar-section {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 0;
                background: rgba(0, 0, 0, 0.1);
                margin-bottom: 10px;
                margin-left: 0;
                margin-right: 0;
            }
            
            .avatar-icon {
                width: 56px;
                height: 56px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
            }
            
            .avatar-text h3 {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: white;
            }
            
            .avatar-text p {
                margin: 0;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .avatar-ellipsis {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 20px;
            }
            
            .avatar-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .logo-icon {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .logo-text h1 {
                margin: 0;
                font-size: 18px;
                font-weight: 700;
                color: white;
            }
            
            .tagline {
                margin: 0;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                font-weight: 400;
            }
            
            .header-actions {
                display: flex;
                gap: 8px;
            }
            
            .icon-btn {
                width: 32px;
                height: 32px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .icon-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
            }
            
            .main-content {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }
            
            .instant-logo-section {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0 2px 0;
                margin-bottom: 2px;
            }
            
            .instant-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .status-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 16px;
                backdrop-filter: blur(10px);
            }
            
            .status-card.success {
                background: rgba(76, 175, 80, 0.1);
                border-color: rgba(76, 175, 80, 0.3);
            }
            
            .status-card.error {
                background: rgba(244, 67, 54, 0.1);
                border-color: rgba(244, 67, 54, 0.3);
            }
            
            .status-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .status-content h3 {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: white;
            }
            
            .status-content p {
                margin: 0;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.4;
            }
            
            .image-section {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .section-header h3 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: white;
            }
            
            .image-wrapper {
                position: relative;
            }
            
            .captured-image {
                width: 100%;
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin-bottom: 12px;
            }
            
            .image-info {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                line-height: 1.4;
            }
            
            .analysis-section h3 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: white;
            }
            
            .clothing-menu {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .clothing-option {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .clothing-option:hover {
                background: rgba(102, 126, 234, 0.1);
                border-color: rgba(102, 126, 234, 0.3);
                transform: translateY(-2px);
            }
            
            .clothing-option h4 {
                margin: 0 0 8px 0;
                font-size: 16px;
                color: #667eea;
                font-weight: 600;
            }
            
            .clothing-description {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.4;
            }
            
            .loading-section {
                text-align: center;
                padding: 20px;
            }
            
            .loading-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid rgba(255, 255, 255, 0.1);
                border-top: 3px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 12px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-text {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
                font-style: italic;
            }
            
            .error-section {
                text-align: center;
                padding: 20px;
            }
            
            .error-icon {
                font-size: 24px;
                margin-bottom: 8px;
            }
            
            .error-text {
                color: #f44336;
                font-weight: 600;
                font-size: 16px;
                margin: 0 0 8px 0;
            }
            
            .error-details {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                margin: 0;
            }
            
            .product-card {
                background: #262626 !important;
                border: none !important;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
                color: white;
                transition: background-color 0.2s ease;
                cursor: pointer;
            }
            
            .product-card:hover {
                background: #3a3a3a !important;
            }
            
            .product-card h4, .product-card h5 {
                color: white;
                margin: 0 0 8px 0;
            }
            
            .product-card .price {
                color: white;
                font-weight: 600;
            }
            
            .product-card .source {
                color: rgba(255, 255, 255, 0.7);
            }
            
            .product-card .product-name {
                color: white;
                font-weight: 600;
            }
            
            .purchase-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .purchase-btn:hover {
                background: #0056b3;
            }
            
            .show-more-btn {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .show-more-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.5);
            }
        `
        document.head.appendChild(style)
    }
    
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
                    displaySimilarProducts(storedData.bestMatch, storedData.alternatives || storedData.products || [], storedData.selectedItem)
                } else {
                    console.log('Results too old, clearing storage')
                    chrome.storage.local.remove(['lastProductResults'])
                }
            }
        } catch (error) {
            console.error('Error restoring product results:', error)
        }
    }
    
    // Function to load last captured image
    async function loadLastCapturedImage() {
        try {
            const result = await chrome.storage.local.get(['lastCapturedImage', 'lastDimensions', 'lastVideoInfo'])
            if (result.lastCapturedImage) {
                console.log('📸 Loading last captured image...')
                
                if (capturedImage) {
                    capturedImage.src = result.lastCapturedImage
                    capturedImage.style.display = 'block'
                }
                
                if (imageInfo) {
                    const dimensions = result.lastDimensions
                    const videoInfo = result.lastVideoInfo
                    imageInfo.innerHTML = `
                        <p><strong>Dimensions:</strong> ${dimensions?.width || 'Unknown'} x ${dimensions?.height || 'Unknown'}</p>
                        <p><strong>Video Source:</strong> ${videoInfo?.src || 'Unknown'}</p>
                        <p><strong>Current Time:</strong> ${videoInfo?.currentTime || 'Unknown'}s</p>
                    `
                    imageInfo.style.display = 'block'
                }
                
                if (imageContainer) {
                    imageContainer.style.display = 'block'
                }
            }
        } catch (error) {
            console.error('Error loading last captured image:', error)
        }
    }
    
    // Function to display product results
    function displayProductResults(products, bestMatch) {
        console.log('Displaying product results:', { products, bestMatch })
        
        if (!products || products.length === 0) {
            statusDiv.innerHTML = '<p>No products found</p>'
            statusDiv.className = 'status error'
            return
        }
        
        let html = '<div class="product-results">'
        
        // Display best match first
        if (bestMatch) {
            html += `
                <div class="best-match">
                    <h3>Best Match</h3>
                    <div class="product-card best-match-card" style="background: #262626 !important; border: none !important;">
                        <div style="display: flex; gap: 15px; align-items: flex-start;">
                            <img src="${bestMatch.image}" alt="${bestMatch.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; flex-shrink: 0;">
                            <div style="flex: 1; min-width: 0;">
                                <h4 class="product-name" style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: white !important; line-height: 1.3;">${bestMatch.name}</h4>
                                <div style="margin-bottom: 8px;">
                                    <span style="font-weight: 600; color: white; font-size: 16px;">${bestMatch.price}</span>
                                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin-left: 8px;">from ${bestMatch.source}</span>
                                </div>
                                <div style="margin-bottom: 12px; display: flex; gap: 8px;">
                                    <button onclick="openProductLink('${bestMatch.link}')" class="purchase-btn">Purchase</button>
                                    <button class="show-more-btn" data-product-link="${bestMatch.link}">Show More</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
        
        // Display alternatives
        if (products.length > 1) {
            html += '<div class="alternatives"><h3>Alternatives</h3>'
            products.slice(1).forEach((product, index) => {
                html += `
                    <div class="product-card" style="background: #262626 !important; border: none !important;">
                        <div style="display: flex; gap: 15px; align-items: flex-start;">
                            <img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; flex-shrink: 0;">
                            <div style="flex: 1; min-width: 0;">
                                <h5 class="product-name" style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: white !important; line-height: 1.3;">${product.name}</h5>
                                <div style="margin-bottom: 8px;">
                                    <span style="font-weight: 600; color: white; font-size: 16px;">${product.price}</span>
                                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin-left: 8px;">from ${product.source}</span>
                                </div>
                                <div style="margin-bottom: 12px; display: flex; gap: 8px;">
                                    <button onclick="openProductLink('${product.link}')" class="purchase-btn">Purchase</button>
                                    <button class="show-more-btn" data-product-link="${product.link}">Show More</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            })
            html += '</div>'
        }
        
        html += '</div>'
        
        statusDiv.innerHTML = html
        statusDiv.className = 'status success'
    }
    
    
    // Initial status
    statusDiv.innerHTML = '<p>Instant ready! Right-click on Instagram reels to find similar products.</p>'
    statusDiv.className = 'status'
    
    // Check if we have analysis results to show clothing menu
    checkForAnalysisResults()
    
    // Function to check for analysis results and show clothing menu
    async function checkForAnalysisResults() {
        try {
            const result = await chrome.storage.local.get(['lastAnalysis'])
            if (result.lastAnalysis && result.lastAnalysis.items && result.lastAnalysis.items.length > 0) {
                console.log('Found analysis results, showing clothing menu')
                showAnalysisResults(result.lastAnalysis)
            }
        } catch (error) {
            console.error('Error checking for analysis results:', error)
        }
    }
    
    // Show AI analysis results as clothing menu
    function showAnalysisResults(analysis) {
        console.log('Showing analysis results:', analysis)
        
        const statusDiv = document.getElementById('status')
        const imageContainer = document.getElementById('imageContainer')
    
        if (analysis.success && analysis.items && analysis.items.length > 0) {
            // Clear any stored product results when showing new clothing items
            chrome.storage.local.remove(['lastProductResults'])
            
            let html = '<div class="clothing-menu">'
            html += '<div class="clothing-options">'
            
            analysis.items.forEach((item, index) => {
                html += `
                    <div class="clothing-option" data-item-index="${index}">
                        <h4>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</h4>
                        <div class="clothing-description">${item.description}</div>
                    </div>
                `
            })
            
            html += '</div></div>'
            
            statusDiv.innerHTML = html
            statusDiv.className = 'status success'
            
            // Add event listeners to clothing options
            const clothingOptions = statusDiv.querySelectorAll('.clothing-option')
            clothingOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const itemIndex = option.getAttribute('data-item-index')
                    console.log('Clothing item clicked, index:', itemIndex)
                    selectClothingItem(itemIndex)
                })
            })
            
            // Hide the image container when showing clothing menu
            if (imageContainer) {
                imageContainer.style.display = 'none'
            }
        } else {
            statusDiv.innerHTML = '<p>No clothing items detected in the image.</p>'
            statusDiv.className = 'status error'
        }
    }

    // Handle clothing item selection
    async function selectClothingItem(itemIndex) {
        console.log('🎯 selectClothingItem called with index:', itemIndex)
        try {
            const result = await chrome.storage.local.get(['lastAnalysis'])
            console.log('📦 Storage result:', result)
            if (result.lastAnalysis && result.lastAnalysis.items[itemIndex]) {
                const selectedItem = result.lastAnalysis.items[itemIndex]
                console.log('✅ Selected clothing item:', selectedItem)
                
                // Store selected item
                chrome.storage.local.set({
                    selectedClothingItem: selectedItem,
                    timestamp: Date.now()
                })
                
                // Search for similar products
                await searchForSimilarProducts(selectedItem)
            }
        } catch (error) {
            console.error('Error selecting clothing item:', error)
        }
    }

    // Search for similar products
    async function searchForSimilarProducts(item) {
        const statusDiv = document.getElementById('status')
        statusDiv.innerHTML = '<p>Searching for similar products...</p>'
        statusDiv.className = 'status'
        
        try {
            // Get the stored image data for the backend
            const imageResult = await chrome.storage.local.get(['lastCapturedImage'])
            
            const response = await fetch('http://localhost:3001/search-similar-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reelImageData: imageResult.lastCapturedImage,
                    selectedClothingItem: item
                })
            })
            
            const data = await response.json()
            
            if (data.success) {
                // Store results and display them
                chrome.storage.local.set({
                    lastProductResults: {
                        alternatives: data.alternatives || data.similarProducts || [],
                        bestMatch: data.bestMatch,
                        timestamp: Date.now()
                    }
                })
                
                // Use the test-extension style display function
                displaySimilarProducts(data.bestMatch, data.alternatives || data.similarProducts || [], item)
            } else {
                statusDiv.innerHTML = `<p>Search failed: ${data.error}</p>`
                statusDiv.className = 'status error'
            }
        } catch (error) {
            console.error('Error searching for products:', error)
            statusDiv.innerHTML = `<p>Search error: ${error.message}</p>`
            statusDiv.className = 'status error'
        }
    }

    // Display similar products with back button (from test-extension)
    function displaySimilarProducts(bestMatch, alternatives, selectedItem) {
        const statusDiv = document.getElementById('status')
    
    let productsHtml = `
        <div style="margin-bottom: 20px; text-align: center;">
            <button id="backToSearchBtn" style="
                background: #262626; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 6px; 
                font-size: 12px; 
                cursor: pointer;
                margin-bottom: 10px;
            " onmouseover="this.style.background='#333333'" onmouseout="this.style.background='#262626'">
                ← Back to Clothing Selection
            </button>
            <h3 style="margin: 0 0 5px 0; color: white; font-weight: 600;">Items Found</h3>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 14px;">I found some products for you to try!</p>
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
        // Defensive programming - ensure all required fields exist
        const safeProduct = {
            name: product.name || 'Unknown Product',
            price: product.price || 'Price not available',
            imageUrl: product.imageUrl || product.image || 'https://via.placeholder.com/300x200?text=No+Image',
            link: product.link || null,
            source: product.source || 'Unknown Store',
            description: product.description || 'No description available',
            similarity: product.similarity || 0.7,
            isBestMatch: product.isBestMatch || false
        };
        
        const matchLabel = safeProduct.isBestMatch ? 
            '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">BEST MATCH</span>' : 
            `<span style="background: #17a2b8; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">ALTERNATIVE ${index}</span>`;
        
        productsHtml += `
            <div class="product-card" style="background: #262626 !important; border: none !important;">
                <div style="display: flex; gap: 15px; align-items: flex-start;">
                    <img src="${safeProduct.imageUrl}" alt="${safeProduct.name}" style="
                        width: 80px; 
                        height: 80px; 
                        object-fit: cover; 
                        border-radius: 6px;
                        flex-shrink: 0;
                    " onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                    <div style="flex: 1; min-width: 0;">
                        <div style="margin-bottom: 8px;">
                            ${matchLabel}
                        </div>
                        <h4 class="product-name" style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: white !important; line-height: 1.3;">
                            ${safeProduct.name}
                        </h4>
                        <div style="margin-bottom: 8px;">
                            <span style="font-weight: 600; color: white; font-size: 16px;">${safeProduct.price}</span>
                            <span style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin-left: 8px;">from ${safeProduct.source}</span>
                        </div>
                        <div style="margin-bottom: 12px; display: flex; gap: 8px;">
                            <button class="purchase-btn" data-product-link="${safeProduct.link}">
                                Purchase
                            </button>
                            <button class="show-more-btn" data-product-link="${safeProduct.link}">
                                Show More
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
    })
    
    statusDiv.innerHTML = productsHtml
    statusDiv.className = 'status success'
    
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
    
    // Add event listeners to purchase buttons
    const purchaseButtons = statusDiv.querySelectorAll('.purchase-btn[data-product-link]')
    purchaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const link = this.getAttribute('data-product-link')
            console.log('Purchase button clicked, link:', link)
            
            if (link && link !== '#' && link !== 'undefined' && link !== 'null' && link !== null) {
                window.openProductLink(link)
            } else {
                console.error('Invalid or missing product link:', link)
                alert(`Product link not available. Please try again.`)
            }
        })
    })
    
    // Add event listeners to show more buttons
    const showMoreButtons = statusDiv.querySelectorAll('.show-more-btn[data-product-link]')
    showMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const link = this.getAttribute('data-product-link')
            console.log('Show More button clicked, link:', link)
            
            if (link && link !== '#' && link !== 'undefined' && link !== 'null' && link !== null) {
                window.openProductLink(link)
            } else {
                console.error('Invalid or missing product link:', link)
                alert(`Product link not available. Please try again.`)
            }
        })
    })
    }
    
    // Functions are now properly scoped within DOMContentLoaded
})
