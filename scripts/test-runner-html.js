const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

const endpoints = [
    {
        name: 'Health Check',
        method: 'GET',
        url: '/',
        expectedStatus: 200
    },
    {
        name: 'Request Auth OTP',
        method: 'POST',
        url: '/api/auth/phone/request-otp',
        body: { phone: `+9199999${Math.floor(10000 + Math.random() * 90000)}` },
        expectedStatus: 200
    },
    {
        name: 'Aadhaar Request OTP (Bypass)',
        method: 'POST',
        url: '/api/auth/aadhaar/request-otp',
        body: {},
        expectedStatus: 200
    },
    {
        name: 'Fetch Partner Link (Missing Auth)',
        method: 'GET',
        url: '/api/partners/link',
        expectedStatus: 401 // Should fail auth
    }
];

async function runTests() {
    console.log(`\n======================================`);
    console.log(`🚀 RUNNING HTML API TESTS ON: ${BASE_URL}`);
    console.log(`======================================\n`);

    const results = [];
    let passedCount = 0;
    let failedCount = 0;

    for (const test of endpoints) {
        console.log(`Testing: [${test.method}] ${test.name}...`);
        const startTime = Date.now();
        let status = 'FAILED';
        let statusCode = 'N/A';
        let responseData = 'No response';
        let errorMsg = '';

        try {
            const config = {
                method: test.method,
                url: `${BASE_URL}${test.url}`,
                ...((test.method === 'POST' || test.method === 'PUT') && { data: test.body })
            };

            const response = await axios(config);
            statusCode = response.status;
            responseData = JSON.stringify(response.data);

            if (statusCode === test.expectedStatus) {
                status = 'PASSED';
                passedCount++;
            } else {
                failedCount++;
                errorMsg = `Expected status ${test.expectedStatus}, got ${statusCode}`;
            }
        } catch (error) {
            failedCount++;
            if (error.response) {
                statusCode = error.response.status;
                responseData = JSON.stringify(error.response.data);
                if (statusCode === test.expectedStatus) {
                    status = 'PASSED';
                    failedCount--;
                    passedCount++;
                } else {
                    errorMsg = `Expected status ${test.expectedStatus}, got ${statusCode}`;
                }
            } else {
                errorMsg = error.message;
            }
        }

        const duration = Date.now() - startTime;
        console.log(`--> ${status} (${duration}ms)`);

        results.push({
            name: test.name,
            method: test.method,
            url: test.url,
            status,
            statusCode,
            duration,
            errorMsg,
            responseData
        });
    }

    generateHtmlReport(results, passedCount, failedCount);
}

function generateHtmlReport(results, passed, failed) {
    const total = passed + failed;
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    let rowsHtml = '';
    results.forEach(res => {
        const rowClass = res.status === 'PASSED' ? 'bg-green-50' : 'bg-red-50';
        const badgeClass = res.status === 'PASSED' ? 'bg-green-500' : 'bg-red-500';

        rowsHtml += `
            <tr class="${rowClass} border-b">
                <td class="p-3 font-medium">${res.name}</td>
                <td class="p-3"><span class="px-2 py-1 bg-gray-200 text-xs font-bold rounded">${res.method}</span> ${res.url}</td>
                <td class="p-3"><span class="px-2 py-1 text-white text-xs font-bold rounded ${badgeClass}">${res.status}</span></td>
                <td class="p-3 text-gray-600">${res.statusCode}</td>
                <td class="p-3 text-gray-600">${res.duration}ms</td>
                <td class="p-3 text-sm text-red-600">${res.errorMsg}</td>
            </tr>
        `;
    });

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Test Report</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        </style>
    </head>
    <body class="bg-gray-100 p-8">
        <div class="max-w-6xl mx-auto">
            <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div class="bg-blue-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h1 class="text-2xl font-bold">Backend API Test HTML Report</h1>
                        <p class="text-blue-100 mt-1">Target: ${BASE_URL} | Generated on ${new Date().toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-4xl font-bold">${successRate}%</div>
                        <div class="text-blue-100 text-sm uppercase tracking-wide">Success Rate</div>
                    </div>
                </div>
                
                <div class="flex border-b text-center">
                    <div class="flex-1 p-4 border-r">
                        <div class="text-gray-500 text-sm uppercase tracking-wide font-bold">Total Tests</div>
                        <div class="text-2xl font-medium mt-1">${total}</div>
                    </div>
                    <div class="flex-1 p-4 border-r">
                        <div class="text-green-500 text-sm uppercase tracking-wide font-bold">Passed</div>
                        <div class="text-2xl font-medium mt-1">${passed}</div>
                    </div>
                    <div class="flex-1 p-4">
                        <div class="text-red-500 text-sm uppercase tracking-wide font-bold">Failed</div>
                        <div class="text-2xl font-medium mt-1">${failed}</div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b text-gray-600 text-sm uppercase tracking-wide">
                            <th class="p-3">Test Name</th>
                            <th class="p-3">Endpoint</th>
                            <th class="p-3">Status</th>
                            <th class="p-3">Code</th>
                            <th class="p-3">Time</th>
                            <th class="p-3">Error (if any)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
            <div class="text-center text-gray-400 mt-6 text-sm">
                LoanInNeed Automated API Testing
            </div>
        </div>
    </body>
    </html>
    `;

    const reportDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'api-test-report.html');
    fs.writeFileSync(reportPath, html);

    console.log(`\n✅ HTML Report generated successfully!`);
    console.log(`📂 Saved to: ${reportPath}\n`);
}

runTests();
