import crypto from 'crypto';
// Using built-in fetch (Node.js 18+)
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// Amazon API Configuration from environment variables
const AMAZON_CONFIG = {
    accessKey: process.env.AGCOD_ACCESS_KEY || '',
    secretKey: process.env.AGCOD_SECRET_KEY || '',
    partnerId: process.env.AGCOD_PARTNER_ID || '',
    region: process.env.AGCOD_REGION || 'us-east-1',
    endpoint: process.env.AGCOD_ENDPOINT || 'https://agcod-v2.amazon.com'
};

/**
 * Generates a unique creation request ID
 */
function generateCreationRequestId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${AMAZON_CONFIG.partnerId}_${timestamp}_${random}`;
}

/**
 * Creates AWS4 signature for Amazon API request
 */
function createSignedRequest(requestBody, operation) {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substr(0, 8);

    const method = 'POST';
    const canonicalUri = `/${operation}`;
    const canonicalQueryString = '';
    const canonicalHeaders = `accept:application/json\ncontent-type:application/json\nhost:${new URL(AMAZON_CONFIG.endpoint).host}\nx-amz-date:${amzDate}\nx-amz-target:com.amazonaws.agcod.AGCODService.${operation}\n`;
    const signedHeaders = 'accept;content-type;host;x-amz-date;x-amz-target';
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(requestBody)).digest('hex');
    
    const canonicalRequest = [
        method,
        canonicalUri,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${AMAZON_CONFIG.region}/AGCODService/aws4_request`;
    const stringToSign = [
        algorithm,
        amzDate,
        credentialScope,
        crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    const signature = calculateSignature(stringToSign, dateStamp);
    const authorization = `${algorithm} Credential=${AMAZON_CONFIG.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-amz-date': amzDate,
            'x-amz-target': `com.amazonaws.agcod.AGCODService.${operation}`,
            'Authorization': authorization
        },
        body: JSON.stringify(requestBody)
    };
}

/**
 * Calculates AWS4 signature
 */
function calculateSignature(stringToSign, dateStamp) {
    const kDate = crypto.createHmac('sha256', `AWS4${AMAZON_CONFIG.secretKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(AMAZON_CONFIG.region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('AGCODService').digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    
    return crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
}


/**
 * Creates a single Amazon gift card
 * @param {number} amount - Amount in dollars (e.g., 0.01 for 1 cent)
 * @returns {Promise<Object>} Result object with success status and gift card details
 */
async function createGiftCard(amount) {
    try {
        console.log(`🎁 Creating Amazon gift card for $${amount}...`);
        
        // Validate configuration
        if (!AMAZON_CONFIG.accessKey || !AMAZON_CONFIG.secretKey || !AMAZON_CONFIG.partnerId) {
            throw new Error('Amazon API credentials not configured. Please set AGCOD_ACCESS_KEY, AGCOD_SECRET_KEY, and AGCOD_PARTNER_ID environment variables.');
        }
        
        // Validate amount
        if (typeof amount !== 'number' || amount <= 0 || amount > 30) {
            throw new Error('Amount must be between $0.01 and $30');
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
        console.log(`   Partner ID: ${AMAZON_CONFIG.partnerId}`);
        console.log('');

        const signedRequest = createSignedRequest(requestBody, 'CreateGiftCard');
        
        // Make the API call
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

export { createGiftCard, cancelGiftCard };
