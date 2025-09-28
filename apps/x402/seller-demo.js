import express from "express";
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const app = express();
app.use(express.json());

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

// Demo routes without x402 middleware
app.post("/analyze-reel", (req, res) => {
  console.log('\n🔔 x402 Seller received payment request for /analyze-reel');
  console.log('💰 Payment received for reel analysis:');
  console.log('   🤖 OpenAI validation: $0.01');
  console.log('   📊 Total: $0.01');
  console.log('💳 Demo mode - simulating USDC payment on Polygon Amoy...');
  console.log('✅ Payment confirmed and split successfully!');
  
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
  console.log('💳 Demo mode - simulating USDC payment on Polygon Amoy...');
  console.log('✅ Payment confirmed and split successfully!');
  
  res.send({
    success: true,
    message: "Payment verified for product search",
    paymentSplit: PAYMENT_SPLITS["search-similar-products"],
    timestamp: new Date().toISOString()
  });
});

app.listen(4021, () => {
  console.log(`Demo x402 Seller listening at http://localhost:4021`);
  console.log('💡 This is a demo version without real x402 payments');
});
