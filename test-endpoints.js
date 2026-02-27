const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
    console.log(`\n======================================`);
    console.log(`🚀 RUNNING BACKEND INTEGRATION TESTS`);
    console.log(`======================================\n`);

    try {
        // 1. Health Check
        console.log(`[1] Testing Health Check...`);
        const health = await axios.get(`${BASE_URL}/`);
        console.log(`✅ Health Check Passed: ${health.data.message}\n`);

        // 2. Test Request OTP (Unauthenticated Route)
        const testPhone = `+9199999${Math.floor(10000 + Math.random() * 90000)}`;
        console.log(`[2] Requesting OTP for Test Phone (${testPhone})...`);
        const otpResponse = await axios.post(`${BASE_URL}/api/auth/phone/request-otp`, {
            phone: testPhone
        });

        console.log(`✅ Request OTP Passed! Status: ${otpResponse.data.message}\n`);

        console.log(`\n🎉 ALL BASIC INTEGRATION TESTS PASSED SUCCESSFULLY! The backend is working perfectly.`);
        console.log(`(If frontend is still failing, make sure you restarted the Next.js dev server to pick up the .env.local changes!)`);

    } catch (error) {
        console.error(`\n❌ TEST FAILED:`);
        if (error.response) {
            console.error(`- Status: ${error.response.status}`);
            console.error(`- Data:`, JSON.stringify(error.response.data, null, 2));
            console.error(`- Endpoint: ${error.response.config.url}`);
        } else if (error.request) {
            console.error(`No response received. Make sure the backend is running on ${BASE_URL}.`);
            console.error(error.message);
        } else {
            console.error(`Error Setting up Request:`, error.message);
        }
    }
}

testEndpoints();
