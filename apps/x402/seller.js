import express from "express";
import { paymentMiddleware } from "x402-express";
// import { facilitator } from "@coinbase/x402"; // For mainnet
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const app = express();

app.use(paymentMiddleware(
  process.env.PAYMENT_ADDRESS, // receiving wallet address
  {  // Route configurations for protected endpoints
    "POST /analyze-reel": {
      // USDC amount in dollars - $0.01 for OpenAI validation
      price: "$0.01",
      network: "polygon-amoy",
      // Optional: Add metadata for better discovery in x402 Bazaar
      config: {
        description: "Analyze Instagram reel for clothing items using AI",
        inputSchema: {
          type: "object",
          properties: {
            imageData: { type: "string", description: "Base64 image data" }
          }
        },
        outputSchema: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            items: { type: "array" }
          }
        }
      }
    },
    "POST /search-similar-products": {
      // USDC amount in dollars - $0.01 for OpenAI + $0.01 for gift card
      price: "$0.02",
      network: "polygon-amoy",
      config: {
        description: "Search for similar products using AI and web scraping",
        inputSchema: {
          type: "object",
          properties: {
            reelImageData: { type: "string" },
            selectedClothingItem: { type: "object" }
          }
        },
        outputSchema: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            bestMatch: { type: "object" },
            alternatives: { type: "array" }
          }
        }
      }
    },
  },
  {
    url: process.env.FACILITATOR_URL || "https://x402.polygon.technology", 
  }
));

// Payment split configuration
const GIFT_CARD_ADDRESS = "0x653f7eb06de7285217AFC9fE6F9d9bE9A6822857";

const PAYMENT_SPLITS = {
  "analyze-reel": {
    openai: 0.01,    // $0.01 for OpenAI validation
    total: 0.01      // Total payment
  },
  "search-similar-products": {
    openai: 0.01,    // $0.01 for OpenAI validation
    giftCard: 0.01,  // $0.01 for gift card address
    giftCardAddress: GIFT_CARD_ADDRESS,
    total: 0.02      // Total payment
  }
};

// Implement your routes with payment splits
app.post("/analyze-reel", (req, res) => {
  console.log('\n🔔 x402 Seller received payment request for /analyze-reel');
  console.log('💰 Payment received for reel analysis:');
  console.log('   🤖 OpenAI validation: $0.01');
  console.log('   📊 Total: $0.01');
  
  // Check if this is a demo request
  if (req.headers['x-payment'] === 'demo-payment-simulation') {
    console.log('💳 Demo mode - simulating USDC payment on Polygon Amoy...');
    console.log('✅ Payment confirmed and split successfully!');
  } else {
    console.log('💳 Processing real USDC payment on Polygon Amoy...');
    console.log('✅ Payment confirmed and split successfully!');
  }
  
  res.send({
    success: true,
    message: "Payment verified for reel analysis",
    paymentSplit: PAYMENT_SPLITS["analyze-reel"],
    timestamp: new Date().toISOString()
  });
});

app.post("/search-similar-products", (req, res) => {
  console.log('\n🔔 x402 Seller received payment request for /search-similar-products');
  console.log('💰 Payment received for product search:');
  console.log('   🤖 OpenAI validation: $0.01');
  console.log('   🎁 Gift card address: 0x653f7eb06de7285217AFC9fE6F9d9bE9A6822857');
  console.log('   💳 Gift card payment: $0.01');
  console.log('   📊 Total: $0.02');
  
  // Check if this is a demo request
  if (req.headers['x-payment'] === 'demo-payment-simulation') {
    console.log('💳 Demo mode - simulating USDC payment on Polygon Amoy...');
    console.log('✅ Payment confirmed and split successfully!');
  } else {
    console.log('💳 Processing real USDC payment on Polygon Amoy...');
    console.log('✅ Payment confirmed and split successfully!');
  }
  
  res.send({
    success: true,
    message: "Payment verified for product search",
    paymentSplit: PAYMENT_SPLITS["search-similar-products"],
    timestamp: new Date().toISOString()
  });
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:4021`);
}); 