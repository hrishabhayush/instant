// Primer 2.0 - Amazon Automation Content Script
console.log("🚀 Primer 2.0 content script injected on Amazon!")

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📨 Message received:", request)
    
    if (request.action === "ping") {
        console.log("🏓 Ping received - content script is ready!")
        sendResponse({ ready: true })
    } else if (request.action === "addToCart") {
        console.log("🛒 Adding items to cart...")
        addItemsToCart().then(result => {
        sendResponse(result)
        }).catch(error => {
            sendResponse({
                success: false,
                error: error.message
            })
        })
        return true // Keep the message channel open for async response
    } else if (request.action === "applyGiftCard") {
        console.log("🎁 Applying gift card...")
        applyGiftCard(request.giftCardCode).then(result => {
        sendResponse(result)
        }).catch(error => {
            sendResponse({
                success: false,
                error: error.message
            })
        })
        return true // Keep the message channel open for async response
    }
})

// Main function to add items to cart
async function addItemsToCart() {
    try {
        console.log("🛒 Adding items to cart...")
        console.log("Current URL:", window.location.href)
        
        // Check if we're on Amazon product page
        if (!window.location.href.includes('amazon.in')) {
            console.log("❌ Not on Amazon website")
            return {
                success: false,
                error: "Not on Amazon website"
            }
        }
        
        // Wait a bit for the page to fully load
        console.log("⏳ Waiting for page to load...")
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Wait for the specific button to be visible
        console.log("🔍 Waiting for add-to-cart button to be visible...")
        let buttonFound = false
        for (let i = 0; i < 10; i++) {
            const button = document.querySelector('#add-to-cart-button')
            if (button && button.offsetParent !== null) {
                console.log("✅ Add to cart button is visible!")
                buttonFound = true
                break
            }
            console.log(`⏳ Button not visible yet, waiting... (${i + 1}/10)`)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        if (!buttonFound) {
            console.log("❌ Add to cart button never became visible")
            return {
                success: false,
                error: "Add to cart button not visible"
            }
        }
        
        console.log("🔍 Looking for add to cart button...")
        
        // Look for add to cart button
        const addToCartButton = findAddToCartButton()
        if (!addToCartButton) {
            console.log("❌ Add to cart button not found")
            return { 
                success: false, 
                error: "Add to cart button not found"
            }
        }
        
        console.log("✅ Found add to cart button, clicking...")
        
        // Scroll to button to make sure it's visible
        addToCartButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try multiple click methods for reliability
        let clicked = false
        
        // Method 1: Direct click
        try {
            addToCartButton.click()
            clicked = true
            console.log("✅ Direct click successful")
        } catch (error) {
            console.log("⚠️ Direct click failed:", error.message)
        }
        
        // Method 2: Event dispatch if direct click failed
        if (!clicked) {
            try {
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
                addToCartButton.dispatchEvent(clickEvent)
                clicked = true
                console.log("✅ Event dispatch successful")
            } catch (error) {
                console.log("⚠️ Event dispatch failed:", error.message)
            }
        }
        
        // Method 3: Form submission if it's a form button
        if (!clicked && addToCartButton.form) {
            try {
                addToCartButton.form.submit()
                clicked = true
                console.log("✅ Form submission successful")
            } catch (error) {
                console.log("⚠️ Form submission failed:", error.message)
            }
        }
        
        if (!clicked) {
            console.log("❌ All click methods failed")
            return {
                success: false,
                error: "Could not click add to cart button"
            }
        }
        
        // Wait a moment for the action to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        console.log("✅ Item added to cart successfully!")
        return {
            success: true,
            message: "Item added to cart successfully"
        }
        
    } catch (error) {
        console.error("❌ Error adding to cart:", error)
        return {
            success: false,
            error: error.message
        }
    }
}

// Function to find the add to cart button
function findAddToCartButton() {
    console.log("🔍 Searching for add to cart button...")
    
    // List of possible selectors for add to cart button
    const selectors = [
        '#add-to-cart-button',
        '#addToCart',
        'input[name="submit.add-to-cart"]',
        'input[value*="Add to Cart"]',
        'input[value*="Add to cart"]',
        'input[value*="add to cart"]',
        'button[data-action="add-to-cart"]',
        '.a-button-primary input[type="submit"]',
        '#buy-now-button',
        '#buybox input[type="submit"]'
    ]
    
    // Try each selector
    for (const selector of selectors) {
        const button = document.querySelector(selector)
        if (button) {
            console.log(`✅ Found button with selector: ${selector}`)
            console.log("Button details:", {
                tagName: button.tagName,
                type: button.type,
                value: button.value,
                textContent: button.textContent?.trim(),
                className: button.className,
                id: button.id
            })
            return button
        }
    }
    
    // If no specific selector worked, search by text content
    console.log("🔍 Searching by text content...")
    const allButtons = document.querySelectorAll('input[type="submit"], button, input[type="button"]')
    
    for (const button of allButtons) {
        const text = button.value || button.textContent || ''
        if (text.toLowerCase().includes('add to cart') || 
            text.toLowerCase().includes('add to basket') ||
            text.toLowerCase().includes('buy now')) {
            console.log(`✅ Found button by text: "${text}"`)
            return button
        }
    }
    
    console.log("❌ No add to cart button found")
    return null
}

// Auto-detect product pages and trigger add to cart
function initializeContentScript() {
    console.log("🚀 Primer 2.0 content script initialized!")
    console.log("📍 Current URL:", window.location.href)
    
    if (window.location.href.includes('amazon.com') || window.location.href.includes('amazon.in')) {
        console.log("✅ Amazon detected, ready for Primer integration!")
        
        // Check if this is a product page
        const isProductPage = window.location.href.includes('/dp/') || 
                             window.location.href.includes('/gp/product/') ||
                             window.location.href.includes('/product/') ||
                             window.location.href.includes('handle-buy-box')
        
        // Check if this is a cart page
        const isCartPage = window.location.href.includes('/cart') || 
                          window.location.href.includes('/smart-wagon')
        
        // Check if this is a checkout page
        const isCheckoutPage = window.location.href.includes('/checkout') || 
                              window.location.href.includes('/payment') ||
                              window.location.href.includes('/place-order')
        
        if (isProductPage) {
            console.log("📦 Product page detected, auto-adding to cart...")
            console.log("⏰ Will auto-add to cart in 3 seconds...")
            
            // Auto-trigger after 3 seconds
            setTimeout(() => {
                console.log("⏰ 3 seconds passed, triggering auto-add to cart...")
                autoAddToCart()
            }, 2000)
            
            // Backup trigger after 8 seconds in case first attempt fails
            setTimeout(() => {
                console.log("⏰ 8 seconds passed, backup auto-add to cart...")
                autoAddToCart()
            }, 2000)
            
        } else if (isCartPage) {
            console.log("🛒 Cart page detected, auto-proceeding to checkout...")
            console.log("⏰ Will proceed to checkout in 3 seconds...")
            
            // Auto-trigger checkout after 3 seconds
            setTimeout(() => {
                console.log("⏰ 3 seconds passed, triggering proceed to checkout...")
                proceedToCheckout()
            }, 2000)
            
        } else if (isCheckoutPage) {
            console.log("💳 Checkout page detected, auto-continuing...")
            console.log("⏰ Will continue checkout in 3 seconds...")
            
            // Auto-trigger continue after 3 seconds
            setTimeout(() => {
                console.log("⏰ 3 seconds passed, triggering continue checkout...")
                continueCheckout()
            }, 2000)
            
            // Auto-apply gift card after 8 seconds (in case gift card section is available)
            setTimeout(() => {
                console.log("⏰ 8 seconds passed, checking for gift card section...")
                autoApplyGiftCard()
            }, 8000)
            
        } else {
            console.log("ℹ️ Not a product, cart, or checkout page, no auto-action")
            console.log("ℹ️ Current URL pattern:", window.location.pathname)
        }
    } else {
        console.log("ℹ️ Not on Amazon, no action needed")
    }
}

// Auto add to cart function
async function autoAddToCart() {
    console.log("🤖 Auto-add to cart triggered!")
    
    try {
        const result = await addItemsToCart()
        if (result.success) {
            console.log("🎉 Auto-add to cart successful!")
        } else {
            console.log("❌ Auto-add to cart failed:", result.error)
        }
    } catch (error) {
        console.error("❌ Auto-add to cart error:", error)
    }
}

// Auto proceed to checkout function
async function proceedToCheckout() {
    console.log("🛒 Auto-proceed to checkout triggered!")
    
    try {
        const result = await clickProceedToCheckout()
        if (result.success) {
            console.log("🎉 Proceed to checkout successful!")
        } else {
            console.log("❌ Proceed to checkout failed:", result.error)
        }
    } catch (error) {
        console.error("❌ Proceed to checkout error:", error)
    }
}

// Function to click proceed to checkout button
async function clickProceedToCheckout() {
    try {
        console.log("🛒 Looking for proceed to checkout button...")
        console.log("Current URL:", window.location.href)
        
        // Wait a bit for the page to fully load
        console.log("⏳ Waiting for page to load...")
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Look for the proceed to checkout button
        const checkoutButton = findProceedToCheckoutButton()
        if (!checkoutButton) {
            console.log("❌ Proceed to checkout button not found")
            return {
                success: false,
                error: "Proceed to checkout button not found"
            }
        }
        
        console.log("✅ Found proceed to checkout button, clicking...")
        
        // Scroll to button to make sure it's visible
        checkoutButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try multiple click methods for reliability
        let clicked = false
        
        // Method 1: Direct click
        try {
            checkoutButton.click()
            clicked = true
            console.log("✅ Direct click successful")
        } catch (error) {
            console.log("⚠️ Direct click failed:", error.message)
        }
        
        // Method 2: Event dispatch if direct click failed
        if (!clicked) {
            try {
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
                checkoutButton.dispatchEvent(clickEvent)
                clicked = true
                console.log("✅ Event dispatch successful")
            } catch (error) {
                console.log("⚠️ Event dispatch failed:", error.message)
            }
        }
        
        // Method 3: Form submission if it's a form button
        if (!clicked && checkoutButton.form) {
            try {
                checkoutButton.form.submit()
                clicked = true
                console.log("✅ Form submission successful")
            } catch (error) {
                console.log("⚠️ Form submission failed:", error.message)
            }
        }
        
        if (!clicked) {
            console.log("❌ All click methods failed")
            return {
                success: false,
                error: "Could not click proceed to checkout button"
            }
        }
        
        // Wait a moment for the action to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        console.log("✅ Proceed to checkout clicked successfully!")
        return {
            success: true,
            message: "Proceed to checkout clicked successfully"
        }
        
    } catch (error) {
        console.error("❌ Error clicking proceed to checkout:", error)
        return {
            success: false,
            error: error.message
        }
    }
}

// Function to find the proceed to checkout button
function findProceedToCheckoutButton() {
    console.log("🔍 Searching for proceed to checkout button...")
    
    // List of possible selectors for proceed to checkout button
    const selectors = [
        'input[name="proceedToRetailCheckout"]',
        'input[data-feature-id="proceed-to-checkout-action"]',
        'input[value*="Proceed to checkout"]',
        'input[value*="Proceed to Checkout"]',
        'input[value*="proceed to checkout"]',
        'input[value*="Checkout"]',
        'input[value*="checkout"]',
        '.a-button-primary input[type="submit"]',
        '#sc-buy-box-ptc-button',
        'input[aria-labelledby*="sc-buy-box-ptc-button"]'
    ]
    
    // Try each selector
    for (const selector of selectors) {
        const button = document.querySelector(selector)
        if (button) {
            console.log(`✅ Found button with selector: ${selector}`)
            console.log("Button details:", {
                tagName: button.tagName,
                type: button.type,
                value: button.value,
                name: button.name,
                className: button.className,
                id: button.id
            })
            return button
        }
    }
    
    // If no specific selector worked, search by text content
    console.log("🔍 Searching by text content...")
    const allButtons = document.querySelectorAll('input[type="submit"], button, input[type="button"]')
    
    for (const button of allButtons) {
        const text = button.value || button.textContent || ''
        if (text.toLowerCase().includes('proceed to checkout') || 
            text.toLowerCase().includes('checkout') ||
            text.toLowerCase().includes('buy now')) {
            console.log(`✅ Found button by text: "${text}"`)
            return button
        }
    }
    
    console.log("❌ No proceed to checkout button found")
    return null
}

// Auto continue checkout function
async function continueCheckout() {
    console.log("💳 Auto-continue checkout triggered!")
    
    try {
        const result = await clickContinueButton()
        if (result.success) {
            console.log("🎉 Continue checkout successful!")
        } else {
            console.log("❌ Continue checkout failed:", result.error)
        }
    } catch (error) {
        console.error("❌ Continue checkout error:", error)
    }
}

// Function to click continue button
async function clickContinueButton() {
    try {
        console.log("💳 Looking for continue button...")
        console.log("Current URL:", window.location.href)
        
        // Wait a bit for the page to fully load
        console.log("⏳ Waiting for page to load...")
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Look for the continue button
        const continueButton = findContinueButton()
        if (!continueButton) {
            console.log("❌ Continue button not found")
            return {
                success: false,
                error: "Continue button not found"
            }
        }
        
        console.log("✅ Found continue button, clicking...")
        
        // Scroll to button to make sure it's visible
        continueButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try multiple click methods for reliability
        let clicked = false
        
        // Method 1: Direct click
        try {
            continueButton.click()
            clicked = true
            console.log("✅ Direct click successful")
        } catch (error) {
            console.log("⚠️ Direct click failed:", error.message)
        }
        
        // Method 2: Event dispatch if direct click failed
        if (!clicked) {
            try {
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
                continueButton.dispatchEvent(clickEvent)
                clicked = true
                console.log("✅ Event dispatch successful")
            } catch (error) {
                console.log("⚠️ Event dispatch failed:", error.message)
            }
        }
        
        // Method 3: Form submission if it's a form button
        if (!clicked && continueButton.form) {
            try {
                continueButton.form.submit()
                clicked = true
                console.log("✅ Form submission successful")
            } catch (error) {
                console.log("⚠️ Form submission failed:", error.message)
            }
        }
        
        if (!clicked) {
            console.log("❌ All click methods failed")
            return {
                success: false,
                error: "Could not click continue button"
            }
        }
        
        // Wait a moment for the action to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        console.log("✅ Continue button clicked successfully!")
        return {
            success: true,
            message: "Continue button clicked successfully"
        }
        
    } catch (error) {
        console.error("❌ Error clicking continue button:", error)
        return {
            success: false,
            error: error.message
        }
    }
}

// Function to find the continue button
function findContinueButton() {
    console.log("🔍 Searching for continue button...")
    
    // List of possible selectors for continue button
    const selectors = [
        'input[data-csa-c-slot-id="checkout-secondary-continue-shipaddressselect"]',
        'input[data-testid="secondary-continue-button"]',
        'input[data-csa-c-id="xwiim9-goe6rz-ervml7-9bgymp"]',
        'input[aria-labelledby*="checkout-secondary-continue-button"]',
        'input[value*="Continue"]',
        'input[value*="continue"]',
        'input[value*="Next"]',
        'input[value*="next"]',
        'input[value*="Proceed"]',
        'input[value*="proceed"]',
        '.a-button-input input[type="submit"]',
        'input[class*="a-button-input"]'
    ]
    
    // Try each selector
    for (const selector of selectors) {
        const button = document.querySelector(selector)
        if (button) {
            console.log(`✅ Found button with selector: ${selector}`)
            console.log("Button details:", {
                tagName: button.tagName,
                type: button.type,
                value: button.value,
                className: button.className,
                id: button.id,
                'data-testid': button.getAttribute('data-testid'),
                'data-csa-c-slot-id': button.getAttribute('data-csa-c-slot-id')
            })
            return button
        }
    }
    
    // If no specific selector worked, search by text content
    console.log("🔍 Searching by text content...")
    const allButtons = document.querySelectorAll('input[type="submit"], button, input[type="button"]')
    
    for (const button of allButtons) {
        const text = button.value || button.textContent || ''
        if (text.toLowerCase().includes('continue') || 
            text.toLowerCase().includes('next') ||
            text.toLowerCase().includes('proceed')) {
            console.log(`✅ Found button by text: "${text}"`)
            return button
        }
    }
    
    console.log("❌ No continue button found")
    return null
}

// Function to apply gift card
async function applyGiftCard(giftCardCode = "TESTGIFT123") {
    try {
        console.log("🎁 Applying gift card:", giftCardCode)
        console.log("Current URL:", window.location.href)
        
        // Check if we're on Amazon checkout/payment page
        if (!window.location.href.includes('amazon.in') && !window.location.href.includes('amazon.com')) {
            console.log("❌ Not on Amazon website")
            return {
                success: false,
                error: "Not on Amazon website"
            }
        }
        
        // Wait a bit for the page to fully load
        console.log("⏳ Waiting for page to load...")
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Look for the gift card input field
        const giftCardInput = findGiftCardInput()
        if (!giftCardInput) {
            console.log("❌ Gift card input field not found")
            return {
                success: false,
                error: "Gift card input field not found"
            }
        }
        
        console.log("✅ Found gift card input field, entering code...")
        
        // Clear any existing value and enter the gift card code
        giftCardInput.value = ''
        giftCardInput.focus()
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Type the gift card code
        giftCardInput.value = giftCardCode
        
        // Trigger input events to simulate user typing
        giftCardInput.dispatchEvent(new Event('input', { bubbles: true }))
        giftCardInput.dispatchEvent(new Event('change', { bubbles: true }))
        
        console.log("✅ Gift card code entered:", giftCardCode)
        
        // Wait a moment for the input to be processed
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Look for and click the apply button
        const applyButton = findGiftCardApplyButton()
        if (!applyButton) {
            console.log("❌ Apply button not found")
            return {
                success: false,
                error: "Apply button not found"
            }
        }
        
        console.log("✅ Found apply button, clicking...")
        
        // Scroll to button to make sure it's visible
        applyButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try multiple click methods for reliability
        let clicked = false
        
        // Method 1: Direct click
        try {
            applyButton.click()
            clicked = true
            console.log("✅ Direct click successful")
        } catch (error) {
            console.log("⚠️ Direct click failed:", error.message)
        }
        
        // Method 2: Event dispatch if direct click failed
        if (!clicked) {
            try {
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
                applyButton.dispatchEvent(clickEvent)
                clicked = true
                console.log("✅ Event dispatch successful")
            } catch (error) {
                console.log("⚠️ Event dispatch failed:", error.message)
            }
        }
        
        // Method 3: Form submission if it's a form button
        if (!clicked && applyButton.form) {
            try {
                applyButton.form.submit()
                clicked = true
                console.log("✅ Form submission successful")
            } catch (error) {
                console.log("⚠️ Form submission failed:", error.message)
            }
        }
        
        if (!clicked) {
            console.log("❌ All click methods failed")
            return {
                success: false,
                error: "Could not click apply button"
            }
        }
        
        // Wait a moment for the action to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        console.log("✅ Gift card applied successfully!")
        return {
            success: true,
            message: "Gift card applied successfully"
        }
        
    } catch (error) {
        console.error("❌ Error applying gift card:", error)
        return {
            success: false,
            error: error.message
        }
    }
}

// Function to find the gift card input field
function findGiftCardInput() {
    console.log("🔍 Searching for gift card input field...")
    
    // List of possible selectors for gift card input field
    const selectors = [
        'input[name="ppw-claimCode"]',
        'input[placeholder*="Enter Code"]',
        'input[placeholder*="Enter code"]',
        'input[class*="pmts-claim-code"]',
        'input[class*="claim-code"]',
        'input[id*="claimCode"]',
        'input[autocomplete="off"][maxlength="25"]',
        'input[type="text"][maxlength="25"]'
    ]
    
    // Try each selector
    for (const selector of selectors) {
        const input = document.querySelector(selector)
        if (input) {
            console.log(`✅ Found input with selector: ${selector}`)
            console.log("Input details:", {
                tagName: input.tagName,
                type: input.type,
                name: input.name,
                placeholder: input.placeholder,
                className: input.className,
                id: input.id,
                maxLength: input.maxLength
            })
            return input
        }
    }
    
    console.log("❌ No gift card input field found")
    return null
}

// Function to find the gift card apply button
function findGiftCardApplyButton() {
    console.log("🔍 Searching for gift card apply button...")
    
    // List of possible selectors for apply button
    const selectors = [
        'input[name="ppw-claimCodeApplyPressed"]',
        'input[class*="pmts-claim-code-apply-button"]',
        'input[value*="Apply"]',
        'input[value*="apply"]',
        'input[type="submit"][class*="claim-code"]',
        'span[class*="pmts-claim-code-apply-button"] input',
        'input[class*="pmts-button-input"]'
    ]
    
    // Try each selector
    for (const selector of selectors) {
        const button = document.querySelector(selector)
        if (button) {
            console.log(`✅ Found button with selector: ${selector}`)
            console.log("Button details:", {
                tagName: button.tagName,
                type: button.type,
                value: button.value,
                name: button.name,
                className: button.className,
                id: button.id
            })
            return button
        }
    }
    
    // If no specific selector worked, search by text content in spans
    console.log("🔍 Searching by text content in spans...")
    const allSpans = document.querySelectorAll('span')
    
    for (const span of allSpans) {
        const text = span.textContent || ''
        if (text.toLowerCase().includes('apply') && span.querySelector('input[type="submit"]')) {
            const input = span.querySelector('input[type="submit"]')
            console.log(`✅ Found button by text: "${text}"`)
            return input
        }
    }
    
    console.log("❌ No gift card apply button found")
    return null
}

// Auto apply gift card function
async function autoApplyGiftCard() {
    console.log("🤖 Auto-apply gift card triggered!")
    
    try {
        const result = await applyGiftCard()
        if (result.success) {
            console.log("🎉 Auto-apply gift card successful!")
        } else {
            console.log("❌ Auto-apply gift card failed:", result.error)
        }
    } catch (error) {
        console.error("❌ Auto-apply gift card error:", error)
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContentScript)
} else {
    initializeContentScript()
}
