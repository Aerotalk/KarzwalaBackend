const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testPartnerFlow() {
    try {
        const phone = `99999${Math.floor(10000 + Math.random() * 90000)}`;

        console.log('--- Step 1: Admin Login ---');
        const adminRes = await axios.post(`${API_URL}/users/admin-login`, {
            email: 'superadmin@test.com',
            password: 'admin123'
        });
        const adminToken = adminRes.data.token;
        console.log('✅ Admin login success\n');

        console.log('--- Step 2: Register Affiliate (Passwordless) ---');
        const regRes = await axios.post(`${API_URL}/partners/register`, {
            name: 'Test Affiliate',
            email: `affiliate+${Date.now()}@test.com`,
            phone: phone,
            partnerType: 'AFFILIATE',
            panNumber: 'ABCDE1234F'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Registration success:', regRes.data.message);
        console.log('Generated Data:', regRes.data);

        console.log('\n--- Step 3: Request Partner OTP ---');
        const otpReq = await axios.post(`${API_URL}/partners/login/request-otp`, {
            phone: `+91${phone}`
        });
        console.log('✅ Request OTP success:', otpReq.data.message);

        console.log('\n--- Step 4: Verify Partner OTP ---');
        const otpVerify = await axios.post(`${API_URL}/partners/login/verify-otp`, {
            phone: `+91${phone}`,
            code: '261102' // Master OTP bypass
        });
        console.log('✅ Verify OTP success, Token:', otpVerify.data.token.substring(0, 20) + '...');

        console.log('\n--- Step 5: Get Partner Profile ---');
        const profileReq = await axios.get(`${API_URL}/partners/profile`, {
            headers: { Authorization: `Bearer ${otpVerify.data.token}` }
        });
        console.log('✅ Partner Profile Name:', profileReq.data.name);
        console.log('✅ Partner Type:', profileReq.data.partnerType);
        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY');

    } catch (error) {
        console.error('❌ Test failed at:', error.config?.url);
        console.error(error.response?.data || error.message);
    }
}

testPartnerFlow();
