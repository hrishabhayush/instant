const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createGiftCard } = require('./amazon-gift-card');

// Load environment variables
dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Primer 2.0 Backend API is running' });
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
    console.log(`🚀 Primer 2.0 Backend API running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🎁 Gift card API: http://localhost:${PORT}/api/gift-card/create`);
});

module.exports = app;
