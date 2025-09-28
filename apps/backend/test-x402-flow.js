import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygonAmoy } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// Test x402 payment flow
async function testX402Flow() {
    console.log('🧪 Testing x402 Payment Flow...\n');
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log('❌ PRIVATE_KEY not set in .env file');
        console.log('Please add your private key to .env file:');
        console.log('PRIVATE_KEY=your_private_key_here');
        return;
    }
    
    const account = privateKeyToAccount(`${privateKey}`);
    console.log('🔑 Using wallet address:', account.address);
    
    const fetchWithPayment = wrapFetchWithPayment(fetch, account);
    
    // Test 1: Reel Analysis Payment ($0.01)
    console.log('\n📸 Test 1: Reel Analysis Payment ($0.01)');
    console.log('💰 Payment split: $0.01 → OpenAI validation');
    
    try {
        const response1 = await fetchWithPayment('http://localhost:4021/analyze-reel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData: 'test_image_data' })
        });
        
        const data1 = await response1.json();
        console.log('✅ Reel analysis payment result:', data1);
        
        if (response1.headers.get("x-payment-response")) {
            const paymentResponse = decodeXPaymentResponse(response1.headers.get("x-payment-response"));
            console.log('💳 Payment details:', paymentResponse);
        }
        
    } catch (error) {
        console.log('❌ Reel analysis payment failed:', error.message);
    }
    
    // Test 2: Product Search Payment ($0.02)
    console.log('\n🛒 Test 2: Product Search Payment ($0.02)');
    console.log('💰 Payment split: $0.01 → OpenAI + $0.01 → Gift card address');
    
    try {
        const response2 = await fetchWithPayment('http://localhost:4021/search-similar-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                clothing: { type: 'tie', color: 'dark', style: 'formal' },
                searchQuery: 'dark formal tie'
            })
        });
        
        const data2 = await response2.json();
        console.log('✅ Product search payment result:', data2);
        
        if (response2.headers.get("x-payment-response")) {
            const paymentResponse = decodeXPaymentResponse(response2.headers.get("x-payment-response"));
            console.log('💳 Payment details:', paymentResponse);
        }
        
    } catch (error) {
        console.log('❌ Product search payment failed:', error.message);
    }
    
    console.log('\n🎉 x402 Payment Flow Test Complete!');
    console.log('\n📊 Transaction Summary:');
    console.log('   💰 Reel Analysis: $0.01 USDC → OpenAI validation');
    console.log('   💰 Product Search: $0.02 USDC → OpenAI + Gift card');
    console.log('   🔗 All payments processed via x402 on Polygon Amoy');
}

testX402Flow().catch(console.error);
