/**
 * Amazon Gift Card Generation Module
 * 
 * This module handles the creation of Amazon gift cards using the Amazon Incentives API
 * WARNING: This involves real money transactions - use with extreme caution!
 */
// Browser-compatible crypto functions using Web Crypto API
const browserCrypto = {
    createHash: (algorithm) => {
        if (algorithm === 'sha256') {
            return {
                update: async (data) => ({
                    digest: async (encoding) => {
                        try {
                            const dataBuffer = new TextEncoder().encode(data);
                            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
                            const hashArray = new Uint8Array(hashBuffer);
                            return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
                        } catch (error) {
                            console.error('SHA-256 error:', error);
                            throw error;
                        }
                    }
                })
            };
        }
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    },
    createHmac: (algorithm, key) => {
        if (algorithm === 'sha256') {
            return {
                update: async (data) => ({
                    digest: async (encoding) => {
                        try {
                            const keyBuffer = new TextEncoder().encode(key);
                            const dataBuffer = new TextEncoder().encode(data);
                            
                            // Import the key for HMAC
                            const cryptoKey = await crypto.subtle.importKey(
                                'raw',
                                keyBuffer,
                                { name: 'HMAC', hash: 'SHA-256' },
                                false,
                                ['sign']
                            );
                            
                            // Sign the data
                            const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
                            const signatureArray = new Uint8Array(signature);
                            return Array.from(signatureArray).map(b => b.toString(16).padStart(2, '0')).join('');
                        } catch (error) {
                            console.error('HMAC-SHA256 error:', error);
                            throw error;
                        }
                    }
                })
            };
        }
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
};

// Environment variables (in browser extension, these would come from storage or popup)
const getEnvVar = (name) => {
    // Try to get from chrome storage first
    if (typeof chrome !== 'undefined' && chrome.storage) {
        return new Promise((resolve) => {
            chrome.storage.sync.get([name], (result) => {
                resolve(result[name] || '');
            });
        });
    }
    // Fallback to empty string
    return '';
};

// Amazon API Configuration
let AMAZON_CONFIG = {
    endpoint: 'https://agcod-v2-gamma.amazon.com', // Use production endpoint for real transactions
    partnerId: 'TEST', // Will be loaded from storage
    accessKey: '',
    secretKey: '',
    region: 'us-east-1',
    service: 'AGCODService'
};

// Load configuration from storage
async function loadConfig() {
    try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            const result = await new Promise((resolve) => {
                chrome.storage.sync.get([
                    'AMAZON_PARTNER_ID', 
                    'AMAZON_ACCESS_KEY', 
                    'AMAZON_SECRET_KEY'
                ], resolve);
            });
            
            AMAZON_CONFIG.partnerId = result.AMAZON_PARTNER_ID || 'TEST';
            AMAZON_CONFIG.accessKey = result.AMAZON_ACCESS_KEY || '';
            AMAZON_CONFIG.secretKey = result.AMAZON_SECRET_KEY || '';
        }
    } catch (error) {
        console.error('Failed to load Amazon API configuration:', error);
    }
}

/**
 * Generates a unique creation request ID
 * Must start with partnerId and be globally unique
 */
function generateCreationRequestId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${AMAZON_CONFIG.partnerId}${timestamp}${random}`;
}

/**
 * Creates AWS Signature Version 4 signature for the request
 */
async function createAWSSignature(method, path, headers, payload, timestamp) {
    const date = timestamp.substring(0, 8);
    const dateStamp = date;
    const credentialScope = `${dateStamp}/${AMAZON_CONFIG.region}/${AMAZON_CONFIG.service}/aws4_request`;
    
    // Create canonical headers
    const canonicalHeaders = Object.keys(headers)
        .sort()
        .map(key => `${key.toLowerCase()}:${headers[key]}`)
        .join('\n') + '\n';
    
    // Create signed headers
    const signedHeaders = Object.keys(headers)
        .sort()
        .map(key => key.toLowerCase())
        .join(';');
    
    // Create payload hash
    const payloadHash = await browserCrypto.createHash('sha256').update(payload).digest('hex');
    
    // Create canonical request
    const canonicalRequest = [
        method,
        path,
        '', // query string (empty for this API)
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');
    
    // Hash canonical request
    const canonicalRequestHash = await browserCrypto.createHash('sha256').update(canonicalRequest).digest('hex');
    
    // Create string to sign
    const stringToSign = [
        'AWS4-HMAC-SHA256',
        timestamp,
        credentialScope,
        canonicalRequestHash
    ].join('\n');
    
    // Create signing key
    const kDate = await browserCrypto.createHmac('sha256', `AWS4${AMAZON_CONFIG.secretKey}`).update(dateStamp).digest('hex');
    const kRegion = await browserCrypto.createHmac('sha256', hexToBuffer(kDate)).update(AMAZON_CONFIG.region).digest('hex');
    const kService = await browserCrypto.createHmac('sha256', hexToBuffer(kRegion)).update(AMAZON_CONFIG.service).digest('hex');
    const kSigning = await browserCrypto.createHmac('sha256', hexToBuffer(kService)).update('aws4_request').digest('hex');
    
    // Create signature
    const signature = await browserCrypto.createHmac('sha256', hexToBuffer(kSigning)).update(stringToSign).digest('hex');
    
    return {
        authorization: `AWS4-HMAC-SHA256 Credential=${AMAZON_CONFIG.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
        timestamp,
        signedHeaders
    };
}

// Helper function to convert hex string to buffer
function hexToBuffer(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
}

/**
 * Creates a signed request object for the Amazon API
 */
async function createSignedRequest(requestBody, operation) {
    const method = 'POST';
    const path = `/${operation}`;
    const payload = JSON.stringify(requestBody);
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    
    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'host': AMAZON_CONFIG.endpoint.replace('https://', ''),
        'x-amz-date': timestamp,
        'x-amz-target': `com.amazonaws.agcod.${AMAZON_CONFIG.service}.${operation}`
    };
    
    const signature = await createAWSSignature(method, path, headers, payload, timestamp);
    
    return {
        method,
        headers: {
            ...headers,
            'Authorization': signature.authorization
        },
        body: payload
    };
}

/**
 * Creates a mock gift card for testing purposes
 * @param {number} amount - Amount in dollars
 * @returns {Promise<Object>} Result object with mock gift card details
 */
async function createMockGiftCard(amount) {
    console.log(`🎁 Creating MOCK Amazon gift card for $${amount}...`);
    console.log('⚠️ This is a TEST gift card - it will NOT work on Amazon!');
    
    // Generate a mock gift card code
    const mockClaimCode = 'MOCK' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 6).toUpperCase();
    const mockGcId = 'A2GCMOCK' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const creationRequestId = generateCreationRequestId();
    
    console.log('✅ Mock Gift Card Created!');
    console.log('🎫 Mock Gift Card Details:');
    console.log(`   📋 Claim Code: ${mockClaimCode}`);
    console.log(`   🆔 Gift Card ID: ${mockGcId}`);
    console.log(`   💵 Amount: $${amount} USD`);
    console.log(`   📅 Expiration Date: No expiration (Mock)`);
    console.log(`   🔗 Creation Request ID: ${creationRequestId}`);
    console.log('');
    console.log('🎉 MOCK REDEEM CODE:', mockClaimCode);
    console.log('⚠️ WARNING: This is a TEST code and will NOT work on Amazon!');
    console.log('');
    
    return {
        success: true,
        claimCode: mockClaimCode,
        gcId: mockGcId,
        amount: amount,
        expirationDate: null,
        creationRequestId: creationRequestId,
        isMock: true
    };
}

/**
 * Creates a single Amazon gift card
 * @param {number} amount - Amount in dollars (e.g., 0.01 for 1 cent)
 * @returns {Promise<Object>} Result object with success status and gift card details
 */
async function createGiftCard(amount) {
    try {
        console.log(`🎁 Creating Amazon gift card for $${amount}...`);
        
        // Load configuration from storage
        await loadConfig();
        
        // Debug: Log current configuration
        console.log('🔍 Amazon API Configuration:', {
            partnerId: AMAZON_CONFIG.partnerId,
            accessKey: AMAZON_CONFIG.accessKey ? '***configured***' : 'NOT SET',
            secretKey: AMAZON_CONFIG.secretKey ? '***configured***' : 'NOT SET',
            endpoint: AMAZON_CONFIG.endpoint
        });
        
        // Validate amount
        if (typeof amount !== 'number' || amount <= 0 || amount > 30) {
            throw new Error('Amount must be between $0.01 and $30');
        }
        
        // Validate configuration
        if (!AMAZON_CONFIG.accessKey || !AMAZON_CONFIG.secretKey || !AMAZON_CONFIG.partnerId || AMAZON_CONFIG.partnerId === 'TEST') {
            console.log('⚠️ Amazon API credentials not configured. Using mock gift card generation for testing.');
            console.log('💡 To use real API, configure credentials using:');
            console.log('   chrome.runtime.sendMessage({');
            console.log('     action: "setAmazonCredentials",');
            console.log('     partnerId: "YourPartnerId",');
            console.log('     accessKey: "YourAccessKey",');
            console.log('     secretKey: "YourSecretKey"');
            console.log('   });');
            return createMockGiftCard(amount);
        }
        
        const creationRequestId = generateCreationRequestId();
        
        const requestBody = {
            creationRequestId,
            partnerId: AMAZON_CONFIG.partnerId,
            value: {
                currencyCode: 'USD',
                amount: amount
            }
        };

        console.log('📤 Request details:');
        console.log(`   Creation Request ID: ${creationRequestId}`);
        console.log(`   Amount: $${amount} USD`);
        console.log('');

        const signedRequest = await createSignedRequest(requestBody, 'CreateGiftCard');
        
        // Use fetch API (available in modern browsers and Node.js 18+)
        const response = await fetch(`${AMAZON_CONFIG.endpoint}/CreateGiftCard`, {
            method: signedRequest.method,
            headers: signedRequest.headers,
            body: signedRequest.body
        });
        
        const responseText = await response.text();
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response body:', responseText);
        console.log('');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        // Parse response
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON response:', parseError);
            throw new Error(`Invalid JSON response: ${responseText}`);
        }

        if (responseData.status === 'SUCCESS' && responseData.gcClaimCode) {
            console.log('✅ Amazon Gift Card Created Successfully!');
            console.log('🎫 Gift Card Details:');
            console.log(`   📋 Claim Code: ${responseData.gcClaimCode}`);
            console.log(`   🆔 Gift Card ID: ${responseData.gcId}`);
            console.log(`   💵 Amount: $${amount} USD`);
            console.log(`   📅 Expiration Date: ${responseData.gcExpirationDate || 'No expiration (US)'}`);
            console.log(`   🔗 Creation Request ID: ${responseData.creationRequestId}`);
            console.log('');
            console.log('🎉 REDEEM CODE:', responseData.gcClaimCode);
            console.log('');
            
            return {
                success: true,
                claimCode: responseData.gcClaimCode,
                gcId: responseData.gcId,
                amount: amount,
                expirationDate: responseData.gcExpirationDate,
                creationRequestId: responseData.creationRequestId
            };
        } else {
            console.error('❌ Amazon Gift Card Creation Failed');
            console.log(`   Status: ${responseData.status}`);
            console.log(`   Error Code: ${responseData.errorCode || 'Unknown'}`);
            console.log(`   Message: ${responseData.message || 'No message provided'}`);
            
            return {
                success: false,
                error: responseData.message || 'Failed to create gift card',
                errorCode: responseData.errorCode,
                status: responseData.status
            };
        }

    } catch (error) {
        console.error('❌ Error creating Amazon gift card:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Cancels an Amazon gift card (must be within 15 minutes of creation)
 * @param {string} gcId - Gift Card ID from creation response
 * @param {string} creationRequestId - Original creation request ID
 * @returns {Promise<Object>} Result object with cancellation status
 */
async function cancelGiftCard(gcId, creationRequestId) {
    try {
        console.log(`🗑️ Cancelling Amazon gift card ${gcId}...`);
        
        const requestBody = {
            creationRequestId: `${creationRequestId}_cancel`,
            partnerId: AMAZON_CONFIG.partnerId,
            gcId: gcId
        };

        const signedRequest = createSignedRequest(requestBody, 'CancelGiftCard');
        
        const response = await fetch(`${AMAZON_CONFIG.endpoint}/CancelGiftCard`, {
            method: signedRequest.method,
            headers: signedRequest.headers,
            body: signedRequest.body
        });
        
        const responseText = await response.text();
        const responseData = JSON.parse(responseText);
        
        if (responseData.status === 'SUCCESS') {
            console.log('✅ Gift card cancelled successfully!');
            return {
                success: true,
                message: 'Gift card cancelled successfully'
            };
        } else {
            console.log('❌ Gift card cancellation failed:', responseData.message);
            return {
                success: false,
                error: responseData.message || 'Failed to cancel gift card'
            };
        }

    } catch (error) {
        console.error('❌ Error cancelling gift card:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Set Amazon API credentials
 */
async function setCredentials(partnerId, accessKey, secretKey) {
    try {
        AMAZON_CONFIG.partnerId = partnerId;
        AMAZON_CONFIG.accessKey = accessKey;
        AMAZON_CONFIG.secretKey = secretKey;
        
        // Save to chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await new Promise((resolve, reject) => {
                chrome.storage.sync.set({
                    AMAZON_PARTNER_ID: partnerId,
                    AMAZON_ACCESS_KEY: accessKey,
                    AMAZON_SECRET_KEY: secretKey
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        }
        
        console.log('✅ Amazon API credentials configured');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to set credentials:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test Amazon API connection
 */
async function testConnection() {
    try {
        await loadConfig();
        if (!AMAZON_CONFIG.accessKey || !AMAZON_CONFIG.secretKey || !AMAZON_CONFIG.partnerId || AMAZON_CONFIG.partnerId === 'TEST') {
            return { success: false, error: 'Credentials not configured' };
        }
        
        // Try to create a very small test gift card
        const result = await createGiftCard(0.01);
        return result;
    } catch (error) {
        console.error('❌ Connection test failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Set test credentials for development (DO NOT USE IN PRODUCTION)
 */
async function setTestCredentials() {
    console.log('⚠️ Setting TEST credentials - DO NOT USE IN PRODUCTION!');
    return await setCredentials(
        'Test', // Test partner ID
        'fake-access-key', // Fake access key
        'fake-secret-key'  // Fake secret key
    );
}

// Export functions for use in other modules
// Browser environment - ensure immediate availability
window.AmazonGiftCard = { 
    createGiftCard, 
    cancelGiftCard, 
    createMockGiftCard,
    setCredentials,
    setTestCredentials,
    testConnection,
    AMAZON_CONFIG: () => AMAZON_CONFIG,
    loadConfig 
};

// Also make it available immediately
if (typeof window !== 'undefined') {
    console.log('✅ Amazon Gift Card module initialized and available');
}
