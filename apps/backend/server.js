import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import OpenAI from 'openai';
// import simpleProductMatcher from './services/simpleProductMatcher';
import { findSimilarProducts } from './matcher.js';
import { testAmazonAPI } from './scrapers/serpapi.js';

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY is required but not set.');
    console.error('Please create a .env file with your OpenAI API key:');
    console.error('OPENAI_API_KEY=your_api_key_here');
    process.exit(1);
}

import { createGiftCard } from './amazon-gift-card.js';

// Load environment variables
dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors({
    // origin: function (origin, callback) {
    //     // Allow requests with no origin (like mobile apps or curl requests)
    //     if (!origin) return callback(null, true);
        
    //     // Allow Chrome extension origins (chrome-extension://)
    //     if (origin.startsWith('chrome-extension://')) {
    //         return callback(null, true);
    //     }
        
    //     // Allow localhost for development
    //     if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    //         return callback(null, true);
    //     }
        
    //     // Allow other origins from environment variable
    //     const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    //     if (allowedOrigins.includes(origin)) {
    //         return callback(null, true);
    //     }
        
    //     callback(new Error('Not allowed by CORS'));
    // },
    // credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Primer 2.0 Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Analyze Instagram reel image
app.post('/analyze-reel', async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ 
                error: 'No image data provided' 
            });
        }

        // Validate image data format
        if (!imageData.startsWith('data:image/')) {
            console.error('❌ Invalid image data format:', imageData.substring(0, 50) + '...');
            return res.status(400).json({ 
                error: 'Invalid image data format. Expected data URL.' 
            });
        }

        console.log('📸 Image data received:', {
            length: imageData.length,
            format: imageData.substring(0, 20) + '...',
            isDataUrl: imageData.startsWith('data:image/')
        });

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ 
                error: 'OpenAI API key not configured' 
            });
        }

        console.log('Analyzing reel image...');

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Analyze this image and identify all clothing items the person is wearing. 
                        
For each clothing item, provide:
- type: clothing category (shirt, pants, shoes, hat, etc.)
- color: specific color name
- style: casual, formal, athletic, etc.
- material: cotton, denim, leather, etc.
- description: detailed description
- confidence: how sure you are (0-1)

Focus only on clothing items. Ignore accessories like jewelry, watches, phones.
Return as JSON array with this exact structure.

Example format:
[
    {
        "type": "shirt",
        "color": "blue",
        "style": "casual",
        "material": "cotton",
        "description": "blue cotton t-shirt with crew neck",
        "confidence": 0.95
    }
]`
                    },
                    {
                        type: "image_url",
                        image_url: { url: imageData }
                    }
                ]
            }],
            max_tokens: 1000
        });

        const analysisText = response.choices[0].message.content;
        
        // Try to parse JSON response
        let clothingItems;
        try {
            // Extract JSON from markdown code blocks if present
            let jsonText = analysisText.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            clothingItems = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', analysisText);
            return res.status(500).json({ 
                error: 'Failed to parse AI response',
                rawResponse: analysisText
            });
        }

        console.log('Reel analysis complete:', clothingItems);

        res.json({
            success: true,
            items: clothingItems,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error analyzing reel:', error);
        res.status(500).json({ 
            error: 'Failed to analyze reel',
            message: error.message
        });
    }
});

// Search for similar products using SerpAPI + OpenAI
app.post('/search-similar-products', async (req, res) => {
    try {
        const { reelImageData, selectedClothingItem } = req.body;
        
        if (!reelImageData || !selectedClothingItem) {
            return res.status(400).json({ 
                error: 'Missing required fields: reelImageData and selectedClothingItem' 
            });
        }

        console.log('🔍 Searching for similar products...');
        console.log('Selected clothing:', selectedClothingItem);

        // Create search query from selected clothing item (avoid redundancy)
        const searchQuery = selectedClothingItem.description;
        
        // Use SerpAPI + OpenAI product matching
        const results = await findSimilarProducts(reelImageData, searchQuery);
        
        // Check if there was an error in the matching process
        if (results.error) {
            return res.status(500).json({
                success: false,
                error: results.error,
                message: results.message || "Product matching failed",
                fallback_suggestion: results.fallback_suggestion
            });
        }
        
        console.log(`✅ Found 1 best match + ${results.similar_options?.length || 0} alternatives`);

        // Convert to expected format for extension compatibility
        const bestMatch = results.best_match ? {
            name: results.best_match.product_name,
            price: results.best_match.price,
            image: results.best_match.image_url,
            imageUrl: results.best_match.image_url,
            link: results.best_match.link,
            source: results.best_match.site,
            description: results.best_match.description,
            similarity: 0.9
        } : null;
        
        console.log('🔗 Best match link:', results.best_match?.link);
        console.log('🔗 Best match source:', results.best_match?.site);

        const alternatives = (results.similar_options || []).map((option, index) => {
            console.log(`🔗 Alternative ${index + 1} link:`, option.link);
            console.log(`🔗 Alternative ${index + 1} source:`, option.site);
            return {
                name: option.product_name,
                price: option.price,
                image: option.image_url,
                imageUrl: option.image_url,
                link: option.link,
                source: option.site,
                description: option.description,
                similarity: Math.max(0.7, 0.9 - (index * 0.05))
            };
        });

        const response = {
            success: true,
            selectedItem: selectedClothingItem,
            bestMatch: bestMatch,
            alternatives: alternatives,
            similarProducts: alternatives, // For extension compatibility
            timestamp: new Date().toISOString()
        };
        
        console.log('📤 Sending response to extension:');
        console.log('📤 Best match:', bestMatch);
        console.log('📤 Alternatives count:', alternatives.length);
        console.log('📤 First alternative:', alternatives[0]);
        
        res.json(response);

    } catch (error) {
        console.error('❌ Error searching similar products:', error);
        res.status(500).json({ 
            error: 'Failed to search similar products',
            message: error.message
        });
    }
});

/**
 * Create Amazon Gift Card
 * POST /api/gift-card/create
 */
app.post('/api/gift-card/create', async (req, res) => {
    try {
        // Fixed amount for automation - always $0.01
        const amount = 0.01;
        
        console.log(`🎁 Creating Amazon gift card for $${amount} (automated)...`);
        console.log('📤 Request body:', req.body); // Log for debugging
        
        // Create the gift card using the Amazon API
        const result = await createGiftCard(amount);
        
        if (result.success) {
            console.log('✅ Gift card created successfully:', result.claimCode);
            res.json({
                success: true,
                claimCode: result.claimCode,
                gcId: result.gcId,
                amount: result.amount,
                expirationDate: result.expirationDate,
                creationRequestId: result.creationRequestId
            });
        } else {
            console.error('❌ Gift card creation failed:', result.error);
            res.status(400).json({
                success: false,
                error: result.error,
                errorCode: result.errorCode
            });
        }
        
    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test endpoint for development
app.post('/test-analysis', async (req, res) => {
    try {
        const { testImage } = req.body;
        
        if (!testImage) {
            return res.status(400).json({ 
                error: 'No test image provided' 
            });
        }

        // Simple test response
        const mockAnalysis = [
            {
                type: "shirt",
                color: "blue",
                style: "casual",
                material: "cotton",
                description: "blue cotton t-shirt with crew neck",
                confidence: 0.95
            },
            {
                type: "pants",
                color: "black",
                style: "casual",
                material: "denim",
                description: "black slim-fit jeans",
                confidence: 0.92
            }
        ];

        res.json({
            success: true,
            items: mockAnalysis,
            message: "Mock analysis for testing",
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in test analysis:', error);
        res.status(500).json({ 
            error: 'Test analysis failed',
            message: error.message
        });
    }
});

// Test Amazon API endpoint
app.get('/test-amazon-api', async (req, res) => {
    try {
        console.log("🧪 Testing Amazon API via endpoint...");
        const result = await testAmazonAPI();
        res.json(result);
    } catch (error) {
        console.error('Error testing Amazon API:', error);
        res.status(500).json({ 
            error: 'Amazon API test failed',
            message: error.message
        });
    }
});

/**
 * Test Amazon API connection
 * GET /api/gift-card/test
 */
app.get('/api/gift-card/test', async (req, res) => {
    try {
        console.log('🧪 Testing Amazon API connection...');
        
        // Try to create a very small test gift card
        const result = await createGiftCard(1);
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Connection test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Primer 2.0 Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Reel analysis: http://localhost:${PORT}/analyze-reel`);
    console.log(`Product search: http://localhost:${PORT}/search-similar-products`);
    console.log(`Test endpoint: http://localhost:${PORT}/test-analysis`);
    console.log(`Amazon API test: http://localhost:${PORT}/test-amazon-api`);
    console.log(`🎁 Gift card API: http://localhost:${PORT}/api/gift-card/create`);
    if (!process.env.OPENAI_API_KEY) {
        console.log('WARNING: OPENAI_API_KEY not set. Create .env file with your OpenAI API key.');
    }
    
    if (!process.env.SERPAPI_KEY) {
        console.log('WARNING: SERPAPI_KEY not set. Create .env file with your SerpAPI key.');
    }
});

// Server is started directly, no export needed
