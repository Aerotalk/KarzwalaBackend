const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...\n');

    try {
        // Test 1: Basic connection
        console.log('Test 1: Attempting to connect to database...');
        await prisma.$connect();
        console.log('✅ Successfully connected to database!\n');

        // Test 2: Query execution
        console.log('Test 2: Executing a simple query...');
        const result = await prisma.$queryRaw`SELECT current_database(), current_user, version();`;
        console.log('✅ Query executed successfully!');
        console.log('Database Info:', result[0]);
        console.log('');

        // Test 3: Check if tables exist
        console.log('Test 3: Checking database tables...');
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
        console.log(`✅ Found ${tables.length} tables in the database:`);
        tables.forEach((table, index) => {
            console.log(`   ${index + 1}. ${table.table_name}`);
        });
        console.log('');

        // Test 4: Count records in User table (if exists)
        try {
            console.log('Test 4: Checking User table...');
            const userCount = await prisma.user.count();
            console.log(`✅ User table exists with ${userCount} records\n`);
        } catch (error) {
            console.log('⚠️  User table might not exist or is not accessible');
            console.log('   Error:', error.message, '\n');
        }

        // Test 5: Check Prisma schema sync
        console.log('Test 5: Checking if database schema matches Prisma schema...');
        try {
            // Try to query each main model
            const models = ['User', 'Loan', 'LoanApplication', 'Partner', 'Otp'];
            for (const model of models) {
                const modelName = model.toLowerCase();
                const count = await prisma[modelName].count();
                console.log(`   ✅ ${model}: ${count} records`);
            }
            console.log('');
        } catch (error) {
            console.log('   ⚠️  Some tables might be missing or schema is out of sync');
            console.log('   Error:', error.message, '\n');
        }

        console.log('═══════════════════════════════════════');
        console.log('🎉 DATABASE CONNECTION TEST SUCCESSFUL!');
        console.log('═══════════════════════════════════════\n');

    } catch (error) {
        console.log('═══════════════════════════════════════');
        console.log('❌ DATABASE CONNECTION TEST FAILED!');
        console.log('═══════════════════════════════════════\n');
        console.log('Error Details:');
        console.log('  Name:', error.name);
        console.log('  Message:', error.message);
        console.log('  Code:', error.code || 'N/A');
        console.log('\nFull Error:');
        console.log(error);
        console.log('\n');

        // Provide helpful suggestions
        console.log('💡 Troubleshooting Tips:');
        console.log('  1. Check if DATABASE_URL in .env is correctly formatted');
        console.log('  2. Verify database credentials (host, port, username, password)');
        console.log('  3. Ensure the database server is running and accessible');
        console.log('  4. Check if your IP is whitelisted (for cloud databases)');
        console.log('  5. Verify SSL/TLS settings if required');
        console.log('  6. Run "npx prisma generate" to ensure Prisma Client is up to date');
        console.log('  7. Run "npx prisma db push" or "npx prisma migrate deploy" to sync schema\n');

    } finally {
        await prisma.$disconnect();
        console.log('🔌 Disconnected from database\n');
    }
}

// Run the test
testDatabaseConnection()
    .catch((error) => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
