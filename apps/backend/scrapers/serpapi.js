import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

/**
 * SerpAPI scraper for real product data from Google Shopping, Amazon, etc.
 * @param {string} query - Search query for products
 * @returns {Promise<Array>} Array of candidate products
 */

async function scrapeSerpAPI(query) {
    try {
        console.log(`🔍 Searching via SerpAPI Google Shopping for: ${query}`);
        console.log(`🔗 Google Shopping API URL: https://serpapi.com/search?engine=google_shopping&q=${encodeURIComponent(query)}&gl=in&hl=en`);
        
        if (!process.env.SERPAPI_KEY) {
            console.log("⚠️ SERPAPI_KEY not found in environment variables");
            return [];
        }
        
        // Try multiple search variations if the first one fails
        const searchVariations = [
            query + ' buy online india',
            query,
            // Simplify the query by removing specific details
            query.replace(/with a single button closure|single button|button closure/g, '').trim(),
            // Try with just the main item type
            query.split(' ').slice(0, 3).join(' ') + ' india'
        ];
        
        for (const searchQuery of searchVariations) {
            console.log(`🔍 Trying search variation: ${searchQuery}`);
            
            const response = await axios.get('https://serpapi.com/search', {
                params: {
                    engine: 'google_shopping',
                    q: searchQuery,
                    api_key: process.env.SERPAPI_KEY,
                    num: 15, // Reduced for faster results
                    gl: 'in', // India
                    hl: 'en', // English
                    tbm: 'shop'
                },
                timeout: 30000
            });
            
            console.log(`📊 SerpAPI response status: ${response.data.search_information?.shopping_results_state || 'unknown'}`);
            
            if (response.data.shopping_results && response.data.shopping_results.length > 0) {
                const processedProducts = processProducts(response.data.shopping_results);
                console.log(`✅ Found ${response.data.shopping_results.length} total products, returning ${processedProducts.length} with query: ${searchQuery}`);
                
                // Debug: Check what fields are available in the first result
                if (response.data.shopping_results.length > 0) {
                    console.log("🔍 Debug - First product fields:", Object.keys(response.data.shopping_results[0]));
                    console.log("🔍 Debug - First product data:", JSON.stringify(response.data.shopping_results[0], null, 2));
                }
                
                return processedProducts;
            }
        }
        
        console.log("⚠️ No shopping results found in any search variation");
        return [];
        
    } catch (error) {
        console.error("❌ SerpAPI search failed:", error.message);
        return [];
    }
}

function processProducts(shoppingResults) {
    return shoppingResults.slice(0, 15).map((item, index) => {
        // Extract retailer name from link or use source
        let site = item.source || "Google Shopping";
        
        // Clean up common retailer names
        if (item.link) {
            if (item.link.includes('amazon.in')) {
                site = "Amazon India";
            } else if (item.link.includes('amazon.com')) {
                site = "Amazon US";
            } else if (item.link.includes('myntra.com')) {
                site = "Myntra";
            } else if (item.link.includes('flipkart.com')) {
                site = "Flipkart";
            } else if (item.link.includes('ajio.com')) {
                site = "Ajio";
            } else if (item.link.includes('nykaa.com')) {
                site = "Nykaa";
            } else if (item.link.includes('zara.com')) {
                site = "Zara";
            } else if (item.link.includes('h&m')) {
                site = "H&M";
            } else if (item.link.includes('uniqlo.com')) {
                site = "Uniqlo";
            }
        }
        
        // Check multiple possible link fields - prioritize direct retailer links over Google Shopping
        const productLink = item.product_link || item.serpapi_product_api || item.merchant_link || item.url || item.link || "";
        
        const processedProduct = {
            product_name: item.title || `Product ${index + 1}`,
            price: item.price || "N/A",
            site: site,
            link: productLink,
            image_url: item.thumbnail || "",
            description: item.title || `Product ${index + 1}`,
            serpapi_product_api: item.serpapi_product_api || null // Store for later resolution
        };
        
        console.log(`🔗 Product ${index + 1} raw link:`, item.link);
        console.log(`🔗 Product ${index + 1} product_link:`, item.product_link);
        console.log(`🔗 Product ${index + 1} serpapi_product_api:`, item.serpapi_product_api);
        console.log(`🔗 Product ${index + 1} merchant_link:`, item.merchant_link);
        console.log(`🔗 Product ${index + 1} url:`, item.url);
        console.log(`🔗 Product ${index + 1} processed link:`, processedProduct.link);
        console.log(`🔗 Product ${index + 1} site:`, processedProduct.site);
        
        return processedProduct;
    });
}

/**
 * Search Amazon specifically via SerpAPI Amazon engine
 * @param {string} query - Search query for products
 * @returns {Promise<Array>} Array of Amazon products with guaranteed direct links
 */
async function scrapeAmazonSerpAPI(query) {
    console.log(`🚀 Amazon function called with query: "${query}"`);
    console.log(`🔍 Environment check - SERPAPI_KEY exists: ${!!process.env.SERPAPI_KEY}`);
    
    try {
        console.log(`🛒 Searching Amazon via SerpAPI Amazon engine for: ${query}`);
        console.log(`🔗 Amazon API URL: https://serpapi.com/search?engine=amazon&k=${encodeURIComponent(query)}&amazon_domain=amazon.com`);
        
        if (!process.env.SERPAPI_KEY) {
            console.log("⚠️ SERPAPI_KEY not found in environment variables");
            return [];
        }
        
        console.log(`🔑 API Key exists: ${!!process.env.SERPAPI_KEY}`);
        console.log(`🔑 API Key length: ${process.env.SERPAPI_KEY ? process.env.SERPAPI_KEY.length : 0}`);
        console.log(`📝 Query length: ${query.length}`);
        console.log(`📝 Query encoded: ${encodeURIComponent(query)}`);
        
        const requestParams = {
            engine: 'amazon',
            k: query,
            amazon_domain: 'amazon.com',
            api_key: process.env.SERPAPI_KEY
        };
        
        console.log(`📤 Request params:`, JSON.stringify(requestParams, null, 2));
        console.log(`📤 Making request to: https://serpapi.com/search`);
        
        const response = await axios.get('https://serpapi.com/search', {
            params: {
                ...requestParams,
                num: 10 // Reduced Amazon results for faster response
            },
            timeout: 30000
        });
        
        console.log(`📊 Amazon engine response status: ${response.data.search_metadata?.status || 'unknown'}`);
        
        if (!response.data.organic_results) {
            console.log("⚠️ No Amazon products found via Amazon engine");
            return [];
        }
        
        // Debug: Check what fields are available in the first Amazon result
        if (response.data.organic_results.length > 0) {
            console.log("🔍 Debug - First Amazon product fields:", Object.keys(response.data.organic_results[0]));
            console.log("🔍 Debug - First Amazon product data:", JSON.stringify(response.data.organic_results[0], null, 2));
        }
        
        const products = response.data.organic_results.slice(0, 10).map((item, index) => {
            // Amazon engine provides direct links - no redirects!
            const productLink = item.link || "";
            
            // Convert USD price to INR (1 USD = 88.67 INR)
            let price = item.price?.raw || item.price?.value || item.price || "N/A";
            let priceInRupees = price;
            
            console.log(`💰 Amazon Product ${index + 1} raw price field:`, item.price);
            console.log(`💰 Amazon Product ${index + 1} price value:`, price);
            
            if (price !== "N/A" && typeof price === 'string' && price.trim() !== '') {
                // Extract numeric value from price string (e.g., "$19.99", "19.99", "$1,234.56" -> 19.99, 1234.56)
                const numericMatch = price.match(/[\d,]+\.?\d*/);
                if (numericMatch) {
                    const usdAmount = parseFloat(numericMatch[0].replace(/,/g, ''));
                    if (!isNaN(usdAmount) && usdAmount > 0) {
                        const inrAmount = usdAmount * 88.67;
                        priceInRupees = `₹${inrAmount.toFixed(2)} ($${usdAmount})`;
                        console.log(`💰 Amazon Product ${index + 1} price conversion: ${price} -> ${priceInRupees}`);
                    } else {
                        console.log(`⚠️ Amazon Product ${index + 1} invalid price amount: ${usdAmount}`);
                        priceInRupees = price; // Keep original if conversion fails
                    }
                } else {
                    console.log(`⚠️ Amazon Product ${index + 1} no numeric match found in price: ${price}`);
                    priceInRupees = price; // Keep original if no numeric match
                }
            } else {
                console.log(`⚠️ Amazon Product ${index + 1} price is N/A or invalid:`, price);
            }
            
            const processedProduct = {
                product_name: item.title || `Amazon Product ${index + 1}`,
                price: priceInRupees,
                site: "Amazon US",
                link: productLink,
                image_url: item.thumbnail || "",
                description: item.title || `Amazon Product ${index + 1}`,
                asin: item.asin || "",
                rating: item.rating || 0,
                reviews: item.reviews || 0
            };
            
            console.log(`🔗 Amazon Product ${index + 1} direct link:`, item.link);
            console.log(`🔗 Amazon Product ${index + 1} processed link:`, processedProduct.link);
            console.log(`💰 Amazon Product ${index + 1} price conversion: ${price} -> ${priceInRupees}`);
            
            return processedProduct;
        });
        
        console.log(`✅ Amazon engine found ${products.length} products with DIRECT links`);
        return products;
        
    } catch (error) {
        console.error("❌ SerpAPI Amazon engine error:", error.message);
        if (error.response) {
            console.error("❌ Response status:", error.response.status);
            console.error("❌ Response headers:", error.response.headers);
            console.error("❌ Response data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("❌ Request made but no response received:", error.request);
        } else {
            console.error("❌ Error setting up request:", error.message);
        }
        console.error("❌ Full error object:", error);
        return [];
    }
}

/**
 * Search Myntra specifically via SerpAPI
 * @param {string} query - Search query for products
 * @returns {Promise<Array>} Array of Myntra products
 */
async function scrapeMyntraSerpAPI(query) {
    try {
        console.log(`👗 Searching Myntra via SerpAPI for: ${query}`);
        
        if (!process.env.SERPAPI_KEY) {
            console.log("⚠️ SERPAPI_KEY not found in environment variables");
            return [];
        }
        
        const response = await axios.get('https://serpapi.com/search', {
            params: {
                engine: 'google_shopping',
                q: `site:myntra.com ${query}`,
                api_key: process.env.SERPAPI_KEY,
                num: 15,
                gl: 'in',
                hl: 'en'
            },
            timeout: 30000
        });
        
        if (!response.data.shopping_results) {
            console.log("⚠️ No Myntra results found");
            return [];
        }
        
        const products = response.data.shopping_results
            .filter(item => item.link && item.link.includes('myntra.com'))
            .map((item, index) => ({
                product_name: item.title || `Myntra Product ${index + 1}`,
                price: item.price || "N/A",
                site: "Myntra",
                link: item.link || "",
                image_url: item.thumbnail || "",
                description: item.title || `Myntra Product ${index + 1}`
            }));
        
        console.log(`✅ SerpAPI Myntra found ${products.length} products`);
        return products;
        
    } catch (error) {
        console.error("❌ SerpAPI Myntra error:", error.message);
        return [];
    }
}

/**
 * Resolve direct merchant links for Google Shopping products using SerpAPI Product API
 * @param {Array} products - Array of products with serpapi_product_api field
 * @returns {Promise<Array>} Array of products with resolved direct links
 */
async function resolveDirectLinks(products) {
    console.log(`🔗 Resolving direct links for ${products.length} products`);
    
    const resolvedProducts = [];
    
    for (const product of products) {
        try {
            // Skip if already has a direct link or no serpapi_product_api
            if (product.link && !product.link.includes('google.com/shopping')) {
                console.log(`✅ Product already has direct link: ${product.product_name}`);
                resolvedProducts.push(product);
                continue;
            }
            
            if (!product.serpapi_product_api) {
                console.log(`⚠️ No serpapi_product_api for product: ${product.product_name}`);
                resolvedProducts.push(product);
                continue;
            }
            
            console.log(`🔍 Resolving link for: ${product.product_name}`);
            
            const response = await axios.get(product.serpapi_product_api, {
                params: { api_key: process.env.SERPAPI_KEY },
                timeout: 15000
            });
            
            // Get direct merchant link from sellers
            const seller = response.data.sellers?.[0];
            const directLink = seller?.link || response.data.link || "";
            
            if (directLink && !directLink.includes('google.com/shopping')) {
                console.log(`✅ Resolved direct link: ${directLink}`);
                resolvedProducts.push({
                    ...product,
                    link: directLink
                });
            } else {
                console.log(`⚠️ Could not resolve direct link for: ${product.product_name}`);
                resolvedProducts.push(product);
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.error(`❌ Error resolving link for ${product.product_name}:`, error.message);
            resolvedProducts.push(product);
        }
    }
    
    console.log(`✅ Resolved ${resolvedProducts.length} products`);
    return resolvedProducts;
}

/**
 * Test Amazon API directly with minimal parameters
 * @returns {Promise<Object>} Test result
 */
async function testAmazonAPI() {
    console.log("🧪 Testing Amazon API directly...");
    
    try {
        if (!process.env.SERPAPI_KEY) {
            return { success: false, error: "No API key found" };
        }
        
        const response = await axios.get('https://serpapi.com/search', {
            params: {
                engine: 'amazon',
                k: 'coffee',
                amazon_domain: 'amazon.com',
                api_key: process.env.SERPAPI_KEY
            },
            timeout: 30000
        });
        
        console.log("✅ Amazon API test successful!");
        return { 
            success: true, 
            status: response.data.search_metadata?.status || 'unknown',
            resultsCount: response.data.organic_results?.length || 0
        };
        
    } catch (error) {
        console.error("❌ Amazon API test failed:", error.message);
        if (error.response) {
            console.error("❌ Response status:", error.response.status);
            console.error("❌ Response data:", JSON.stringify(error.response.data, null, 2));
        }
        return { success: false, error: error.message, details: error.response?.data };
    }
}

export { 
    scrapeSerpAPI, 
    scrapeAmazonSerpAPI, 
    scrapeMyntraSerpAPI,
    resolveDirectLinks,
    testAmazonAPI
};