// Simple Product Matcher using OpenAI with structured prompt
const OpenAI = require('openai');

class SimpleProductMatcher {
    constructor() {
        this.openai = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            if (this.initialized) {
                return;
            }
            
            console.log('🤖 Initializing Simple Product Matcher...');
            
            if (!this.openai) {
                this.openai = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY,
                });
            }
            
            this.initialized = true;
            console.log('✅ Simple Product Matcher initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Simple Product Matcher:', error);
            throw error;
        }
    }

    async findSimilarProducts(reelImageData, selectedClothingItem) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            console.log('🔍 Finding similar products using OpenAI...');
            console.log('Selected item:', selectedClothingItem);

            // The structured prompt that does everything
            const prompt = `You are a fashion product expert. Search the web to find similar products to this item:

ITEM: ${selectedClothingItem.description}
DETAILS: ${selectedClothingItem.color} ${selectedClothingItem.material} ${selectedClothingItem.type} (${selectedClothingItem.style} style)

TASK: Search the web for real products that match this item's style, color, and material. Find products available for purchase online.

REQUIREMENTS:
- Search for real products from major retailers (Amazon, Myntra, Ajio, Zara, H&M, etc.)
- Find 1 best match + 3-4 similar alternatives
- All products must be available in India
- Include at least one Amazon option
- Use real product names, prices, and links from your web search
- Focus on visual similarity to the described item

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "best_match": {
    "product_name": "Real product name from web search",
    "image_url": "https://retailer-domain.com/product-image.jpg",
    "price": "₹X,XXX",
    "site": "Retailer Name",
    "link": "https://retailer-domain.com/product-page",
    "description": "Product description"
  },
  "similar_options": [
    {
      "product_name": "Product name",
      "image_url": "https://retailer-domain.com/image.jpg",
      "price": "₹X,XXX",
      "site": "Retailer Name",
      "link": "https://retailer-domain.com/product",
      "description": "Product description"
    }
  ]
}

IMPORTANT: Use web search to find real, current products. Return only valid JSON.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                tools: [{"type": "web_search"}],
                messages: [{
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: { url: reelImageData }
                        }
                    ]
                }],
                max_tokens: 2000
            });

            const responseText = response.choices[0].message.content;
            console.log('📊 OpenAI response:', responseText);

            // Parse the JSON response
            let results;
            try {
                let jsonText = responseText.trim();
                if (jsonText.startsWith('```json')) {
                    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonText.startsWith('```')) {
                    jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }
                
                results = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('❌ Failed to parse OpenAI response:', responseText);
                throw new Error('Failed to parse product recommendations');
            }

            // Convert to our expected format
            const bestMatch = results.best_match ? {
                name: results.best_match.product_name,
                price: results.best_match.price,
                image: results.best_match.image_url,
                imageUrl: results.best_match.image_url, // For extension compatibility
                link: results.best_match.link,
                source: results.best_match.site,
                description: results.best_match.description,
                similarity: 0.9 // High similarity since it's the best match
            } : null;

            const alternatives = results.similar_options ? results.similar_options.map((option, index) => ({
                name: option.product_name,
                price: option.price,
                image: option.image_url,
                imageUrl: option.image_url, // For extension compatibility
                link: option.link,
                source: option.site,
                description: option.description,
                similarity: Math.max(0.7, 0.9 - (index * 0.05)) // Decreasing similarity
            })) : [];

            console.log(`✅ Found 1 best match + ${alternatives.length} alternatives`);
            return { bestMatch, alternatives };

        } catch (error) {
            console.error('❌ Error finding similar products:', error);
            throw error;
        }
    }
}

module.exports = new SimpleProductMatcher();
