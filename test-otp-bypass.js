const axios = require('axios');

const API_BASE_URL = 'https://loaninneed-backend-production-c5a2.up.railway.app';

async function testOtpBypass() {
    console.log('🧪 Testing OTP Bypass Code (261102)\n');

    const testPhone = '+919999999999'; // Test phone number
    const bypassCode = '261102';

    try {
        // Step 1: Request OTP
        console.log('Step 1: Requesting OTP...');
        console.log(`Phone: ${testPhone}`);

        const requestResponse = await axios.post(`${API_BASE_URL}/api/auth/request-otp`, {
            phone: testPhone
        });

        console.log('✅ OTP Request Response:', requestResponse.data);
        console.log('');

        // Step 2: Verify with bypass code
        console.log('Step 2: Verifying with bypass code 261102...');

        const verifyResponse = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
            phone: testPhone,
            code: bypassCode
        });

        console.log('✅ OTP Verification Response:', verifyResponse.data);
        console.log('');

        // Check if we got a token
        if (verifyResponse.data.token) {
            console.log('═══════════════════════════════════════');
            console.log('🎉 OTP BYPASS CODE IS WORKING!');
            console.log('═══════════════════════════════════════');
            console.log('✅ Bypass code 261102 accepted');
            console.log('✅ User authenticated successfully');
            console.log('✅ Token received:', verifyResponse.data.token.substring(0, 20) + '...');
            console.log('');
        } else {
            console.log('⚠️  Verification succeeded but no token received');
        }

    } catch (error) {
        console.log('═══════════════════════════════════════');
        console.log('❌ OTP BYPASS TEST FAILED');
        console.log('═══════════════════════════════════════');

        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
        console.log('');
    }
}

// Run the test
testOtpBypass()
    .then(() => {
        console.log('Test completed.');
    })
    .catch((error) => {
        console.error('Unexpected error:', error);
    });
