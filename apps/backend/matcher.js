const OpenAI = require('openai');
const { scrapeSerpAPI, scrapeAmazonSerpAPI, resolveDirectLinks } = require('./scrapers/serpapi');

/**
 * Finds similar products using Playwright scraping + OpenAI analysis
 * @param {string} croppedImageUrl - Base64 image data or image URL
 * @param {string} query - Search query for products
 * @returns {Promise<Object>} Product match result with best match and alternatives
 */
async function findSimilarProducts(croppedImageUrl, query) {
    // Create unique request ID to prevent race conditions
    const requestId = Math.random().toString(36).substring(7);
    const amazonKey = `amazonProductsWithLinks_${requestId}`;
    
    try {
        console.log(`🔍 Starting product search for: ${query} (request: ${requestId})`);
        
        // Initialize OpenAI client inside function to ensure env vars are loaded
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // Step 1: Search for products using SerpAPI (real data, no blocking)
        console.log("🌐 Searching for products via SerpAPI...");
        
        // Search for products using SerpAPI
        const candidateProducts = await scrapeSerpAPI(query);
        
        console.log(`📦 SerpAPI found: ${candidateProducts.length} products`);

        if (candidateProducts.length === 0) {
            console.log("⚠️ No products found via SerpAPI. Check your SERPAPI_KEY and account status.");
            return {
                best_match: null,
                similar_options: [],
                error: "No products found. Please check your SerpAPI key and account status.",
                fallback_suggestion: "Make sure SERPAPI_KEY is set in your .env file and your account has credits."
            };
        }

        // Always do Amazon-specific search to get products with guaranteed links
        console.log("🛒 Running Amazon-specific search for guaranteed product links");
        
        try {
            const amazonProducts = await scrapeAmazonSerpAPI(query);
            console.log(`🛒 Amazon engine found: ${amazonProducts.length} products with links`);
            
            if (amazonProducts.length > 0) {
                // Store Amazon products separately for later replacement
                global[amazonKey] = amazonProducts;
                console.log(`📦 Stored ${amazonProducts.length} Amazon products with guaranteed links`);
            }
        } catch (error) {
            console.log("⚠️ Amazon-specific search failed:", error.message);
            global[amazonKey] = [];
            console.log("ℹ️ Continuing with Google Shopping results only");
        }

        // Step 2: Ask OpenAI to pick best + alternatives
        console.log("🤖 Analyzing products with OpenAI...");
        const response = await client.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: "You are a product matching assistant. Always output valid JSON.",
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `
The user has uploaded this product image (cropped from an Instagram reel).
We searched for similar products and found these candidates from various retailers.

CANDIDATE RESULTS (raw):
${JSON.stringify(candidateProducts, null, 2)}

TASK:
1. Carefully analyze the product image and compare it with the candidate list.
2. Choose the SINGLE MOST SIMILAR product by visual appearance, style, and description.
   - It should match color, type (vest/shoes/etc.), material, and gender.
   - Prioritize products from major retailers (Amazon, Myntra, etc.) if similarity is close.
3. Choose EXACTLY 3 VERY SIMILAR alternative products (NO EXCEPTIONS).
   - You MUST return exactly 4 total products: 1 best_match + 3 similar_options.
   - They must look reasonably close in appearance (don't be too strict).
   - **CRITICAL REQUIREMENT: You MUST include at least ONE Amazon product (US or India) in your selections if ANY Amazon products exist in the candidate list. NO EXCEPTIONS.**
   - If you don't include an Amazon product when Amazon options are available, your response will be rejected.
   - Prefer more affordable or different retailers (but still very close).
   - **NOTE: A 5th Amazon option will be automatically added after your selection.**
4. Only include products that are relevant to the user's search.
5. Reject irrelevant or mismatched items (e.g. women's dresses if user wanted men's vest).
6. Ensure all products have valid data (name, price, link, image).
7. Return JSON in this **exact structure**:

{
  "best_match": {
    "product_name": "string",
    "image_url": "string",
    "price": "string",
    "site": "string",
    "link": "string",
    "description": "string",
    "serpapi_product_api": "string"
  },
  "similar_options": [
    {
      "product_name": "string",
      "image_url": "string",
      "price": "string",
      "site": "string",
      "link": "string",
      "description": "string",
      "serpapi_product_api": "string"
    }
  ]
}

IMPORTANT:
- Do not invent products. Use only from candidate list.
- Always include prices, links, images, and serpapi_product_api exactly as provided.
- **CRITICAL: Preserve the serpapi_product_api field for each product - this is needed for direct link resolution.**
- **ABSOLUTELY MANDATORY: If ANY Amazon products (US or India) exist in the candidate list, you MUST include at least one Amazon product in your final selection. This is non-negotiable.**
- **FAILURE TO INCLUDE AMAZON WHEN AVAILABLE WILL RESULT IN RESPONSE REJECTION.**
- If there are multiple Amazon options, prioritize the one with the best similarity score.
- **NOTE: Amazon US products show prices in both INR (₹) and USD ($) for your reference.**
- Only return JSON. No extra text.
                            `,
                        },
                        { type: "image_url", image_url: { url: croppedImageUrl } },
                    ],
                },
            ],
        });

        const rawResponse = response.choices[0].message?.content || "{}";
        
        // Parse JSON with error handling
        let result;
        try {
            result = JSON.parse(rawResponse);
        } catch (parseError) {
            console.error("❌ Failed to parse OpenAI JSON response:", parseError);
            console.log("Raw response:", rawResponse);
            return {
                best_match: null,
                similar_options: [],
                error: "AI response parsing failed",
                message: "OpenAI returned invalid JSON format"
            };
        }
        
        console.log("✅ Product matching completed successfully");
        
        // Ensure result has the expected structure
        if (!result.best_match) {
            result.best_match = null;
        }
        if (!result.similar_options) {
            result.similar_options = [];
        }
        
        // FORCE EXACTLY 4 OPTIONS - Post-processing check
        const totalOptions = (result.best_match ? 1 : 0) + result.similar_options.length;
        console.log(`📊 AI returned ${totalOptions} total options (need exactly 4)`);
        
        if (totalOptions < 4) {
            console.log("🚨 AI didn't provide enough options - FORCING 4 total options");
            
            // Get all candidate products that aren't already selected
            const selectedProducts = [
                result.best_match,
                ...result.similar_options
            ].filter(p => p !== null);
            
            const availableProducts = candidateProducts.filter(candidate => 
                !selectedProducts.some(selected => 
                    selected.product_name === candidate.product_name &&
                    selected.link === candidate.link
                )
            );
            
            // Add more products to reach exactly 4 total
            const needed = 4 - totalOptions;
            console.log(`📈 Adding ${needed} more products from ${availableProducts.length} available`);
            
            for (let i = 0; i < needed && i < availableProducts.length; i++) {
                result.similar_options.push(availableProducts[i]);
                console.log(`✅ Added option ${i + 1}: ${availableProducts[i].product_name}`);
            }
        }
        
        // ADD 5TH AMAZON OPTION IMMEDIATELY (if we have Amazon products available)
        if (global[amazonKey] && global[amazonKey].length > 0) {
            console.log("🛒 Adding 5th Amazon option immediately for better user experience");
            
            // Get the best Amazon product that's not already included
            const allSelectedProducts = [
                result.best_match,
                ...result.similar_options
            ].filter(p => p !== null);
            
            const availableAmazonProducts = global[amazonKey].filter(amazonProduct => 
                !allSelectedProducts.some(selected => 
                    selected.product_name === amazonProduct.product_name
                )
            );
            
            if (availableAmazonProducts.length > 0) {
                const bestAmazonProduct = availableAmazonProducts[0];
                result.similar_options.push(bestAmazonProduct);
                console.log(`✅ Added 5th option (Amazon): ${bestAmazonProduct.product_name}`);
            }
        }
        
        // SKIP DIRECT LINK RESOLUTION FOR NON-AMAZON PRODUCTS (save time and API credits)
        console.log("⚡ Skipping direct link resolution for non-Amazon products to improve speed");

        // REPLACE AMAZON PRODUCTS WITH GUARANTEED LINKS
        if (global[amazonKey] && global[amazonKey].length > 0) {
            console.log("🔄 Replacing Amazon products with guaranteed link versions");
            
            const allSelectedProducts = [
                result.best_match,
                ...result.similar_options
            ].filter(p => p !== null);

            // Find Amazon products in the selected results
            const amazonIndices = [];
            allSelectedProducts.forEach((product, index) => {
                if (product && product.site && product.site.toLowerCase().includes('amazon')) {
                    amazonIndices.push(index === 0 ? 'best_match' : index - 1);
                }
            });

            console.log(`🔍 Found ${amazonIndices.length} Amazon products to replace`);

            // Replace each Amazon product with one that has a guaranteed link
            amazonIndices.forEach((index, i) => {
                if (i < global[amazonKey].length) {
                    const replacementProduct = global[amazonKey][i];
                    
                    if (index === 'best_match') {
                        result.best_match = replacementProduct;
                        console.log(`✅ Replaced best match with Amazon product with link: ${replacementProduct.product_name}`);
                    } else if (typeof index === 'number' && index >= 0 && index < result.similar_options.length) {
                        result.similar_options[index] = replacementProduct;
                        console.log(`✅ Replaced similar option ${index} with Amazon product with link: ${replacementProduct.product_name}`);
                    } else {
                        console.log(`⚠️ Invalid index for replacement: ${index}, skipping`);
                    }
                }
            });
        }

        // FORCE AMAZON INCLUSION - Post-processing check
        const amazonProducts = candidateProducts.filter(p => 
            p.site && p.site.toLowerCase().includes('amazon')
        );
        
        if (amazonProducts.length > 0) {
            const allSelectedProducts = [
                result.best_match,
                ...result.similar_options
            ].filter(p => p !== null);
            
            const hasAmazonProduct = allSelectedProducts.some(p => 
                p.site && p.site.toLowerCase().includes('amazon')
            );
            
            if (!hasAmazonProduct) {
                console.log("🚨 AI didn't include Amazon product - FORCING inclusion");
                
                // Use Amazon products with guaranteed links if available
                const availableAmazonProducts = global[amazonKey] && global[amazonKey].length > 0
                    ? global[amazonKey]
                    : amazonProducts;
                
                // Find the best Amazon product (highest price as proxy for quality)
                const bestAmazonProduct = availableAmazonProducts.length === 1 
                    ? availableAmazonProducts[0] 
                    : availableAmazonProducts.reduce((best, current) => {
                        const currentPrice = parseFloat(current.price?.replace(/[^\d.]/g, '') || '0');
                        const bestPrice = parseFloat(best.price?.replace(/[^\d.]/g, '') || '0');
                        return currentPrice > bestPrice ? current : best;
                    });
                
                // Replace the worst similar option with the Amazon product
                if (result.similar_options.length > 0) {
                    result.similar_options[0] = bestAmazonProduct;
                    console.log("✅ Replaced first similar option with Amazon product:", bestAmazonProduct.product_name);
                } else if (result.best_match) {
                    // If no similar options, add Amazon as a similar option
                    result.similar_options = [bestAmazonProduct];
                    console.log("✅ Added Amazon product as similar option:", bestAmazonProduct.product_name);
                } else {
                    // If no best match either, make Amazon the best match
                    result.best_match = bestAmazonProduct;
                    console.log("✅ Made Amazon product the best match:", bestAmazonProduct.product_name);
                }
            } else {
                console.log("✅ Amazon product already included in results");
            }
        } else {
            console.log("ℹ️ No Amazon products found in candidate list");
        }
        
        // 5TH AMAZON OPTION ALREADY ADDED EARLIER FOR BETTER PERFORMANCE
        
        // Final count verification
        const finalCount = (result.best_match ? 1 : 0) + result.similar_options.length;
        console.log(`✅ Final result: ${finalCount} total options (${result.best_match ? '1' : '0'} best match + ${result.similar_options.length} alternatives)`);
        
        // Clean up global variable to prevent memory leaks
        delete global[amazonKey];
        
        return result;

    } catch (error) {
        console.error("❌ Error in product matching:", error);
        
        // Return error object instead of throwing
        return {
            best_match: null,
            similar_options: [],
            error: "Failed to analyze products with AI",
            message: error.message
        };
    }
}

module.exports = { findSimilarProducts };