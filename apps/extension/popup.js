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
    console.log("🚀 Primer 2.0 popup loaded!")
    
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
                    <div class="product-card best-match-card">
                        <img src="${bestMatch.image}" alt="${bestMatch.name}" style="width: 100px; height: 100px; object-fit: cover;">
                        <div class="product-info">
                            <h4>${bestMatch.name}</h4>
                            <p class="price">${bestMatch.price}</p>
                            <p class="source">${bestMatch.source}</p>
                            <button onclick="openProductLink('${bestMatch.link}')" class="purchase-btn">Purchase</button>
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
                    <div class="product-card">
                        <img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover;">
                        <div class="product-info">
                            <h5>${product.name}</h5>
                            <p class="price">${product.price}</p>
                            <p class="source">${product.source}</p>
                            <button onclick="openProductLink('${product.link}')" class="purchase-btn">Purchase</button>
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
    
    // Test button - manually test add to cart (Amazon functionality)
    if (testButton) {
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
    }
    
    // Clear button
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            chrome.storage.local.clear()
            statusDiv.innerHTML = '<p>Primer 2.0 ready! Right-click on Instagram reels to find similar products.</p>'
            statusDiv.className = 'status'
            
            if (imageContainer) imageContainer.style.display = 'none'
            if (capturedImage) capturedImage.style.display = 'none'
            if (imageInfo) imageInfo.style.display = 'none'
        })
    }
    
    // Initial status
    statusDiv.innerHTML = '<p>Primer 2.0 ready! Right-click on Instagram reels to find similar products.</p>'
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
            html += '<h3>What do you want to buy?</h3>'
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
            <div style="
                border: 1px solid #ddd; 
                border-radius: 8px; 
                padding: 15px; 
                margin-bottom: 15px; 
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
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
                        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #333; line-height: 1.3;">
                            ${safeProduct.name}
                        </h4>
                        <div style="margin-bottom: 8px;">
                            <span style="font-weight: 600; color: #28a745; font-size: 16px;">${safeProduct.price}</span>
                            <span style="color: #666; font-size: 12px; margin-left: 8px;">from ${safeProduct.source}</span>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <button style="
                                background: #007bff; 
                                color: white; 
                                border: none; 
                                padding: 8px 16px; 
                                border-radius: 6px; 
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
    const purchaseButtons = statusDiv.querySelectorAll('[data-product-link]')
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
    }
    
    // Functions are now properly scoped within DOMContentLoaded
})
