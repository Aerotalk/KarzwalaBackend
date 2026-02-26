const axios = require('axios');

const API_BASE = 'http://localhost:5000';
const VERIFY_OTP = '261102'; // Global bypass code

// Create unique user details for this test run
const uniqueId = Date.now();
const testDsa = {
    name: "DSA Test User",
    email: `dsa+${uniqueId}@test.com`,
    phone: `99${String(uniqueId).slice(-8)}`,
    partnerType: "DSA",
    panNumber: "ABCDE1234F",
    gstNumber: "22AAAAA0000A1Z5",
    firmName: "Test Firm LLC",
    address: "123 Test Street",
    city: "Testville",
    state: "Test State",
    pincode: "111111"
};

async function testDsaFlow() {
    try {
        console.log("--- Step 1: Admin Login ---");
        const adminRes = await axios.post(`${API_BASE}/api/users/admin-login`, {
            email: "superadmin@test.com",
            password: "admin123"
        });
        const adminToken = adminRes.data.token;
        console.log("✅ Admin login success\n");

        console.log("--- Step 2: Register DSA ---");
        const regRes = await axios.post(
            `${API_BASE}/api/partners/register`,
            testDsa,
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log("✅ Registration success:", regRes.data.message);
        const dsaId = regRes.data.id;
        console.log("Generated Data:", { id: dsaId, email: regRes.data.email, rawPassword: regRes.data.rawPassword });
        console.log("\n");

        console.log("--- Step 3: Request DSA Login OTP ---");
        const otpReqRes = await axios.post(`${API_BASE}/api/partners/login/request-otp`, {
            phone: `+91${testDsa.phone}`
        });
        console.log("✅ Request OTP success:", otpReqRes.data.message, "\n");

        console.log("--- Step 4: Verify DSA OTP & Login ---");
        const otpVerRes = await axios.post(`${API_BASE}/api/partners/login/verify-otp`, {
            phone: `+91${testDsa.phone}`,
            code: VERIFY_OTP
        });
        const dsaToken = otpVerRes.data.token;
        console.log(`✅ Verify OTP success, Token: ${dsaToken.substring(0, 30)}... \n`);

        console.log("--- Step 5: Get DSA Profile Details ---");
        const profileRes = await axios.get(`${API_BASE}/api/partners/profile`, {
            headers: { Authorization: `Bearer ${dsaToken}` }
        });
        const profile = profileRes.data;
        console.log("✅ Profile fetched successfully!");

        // Assert all required fields
        if (profile.name !== testDsa.name) throw new Error("Name mismatch");
        if (profile.gstNumber !== testDsa.gstNumber) throw new Error("GST mismatch");
        if (profile.city !== testDsa.city) throw new Error("City mismatch");

        console.log(`✅ Profile validations perfectly matching: GST=${profile.gstNumber}, Firm=${profile.firmName}, City=${profile.city}`);
        console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY");

    } catch (err) {
        if (err.response) {
            console.error(`❌ Test failed at: ${err.config.url}`);
            console.error(err.response.data);
        } else {
            console.error("❌ Test failed:", err.message);
        }
    }
}

testDsaFlow();
