const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Create connection pool (CLOUD FIX)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10),

    // 🔴 IMPORTANT: required for Aiven cloud
  ssl: {
    ca: Buffer.from(process.env.DB_SSL_CERT)
},

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

const promisePool = pool.promise();

// Test connection
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ MySQL database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);

        console.log('\n📌 Troubleshooting:');
        console.log('1. Check Aiven DB is running');
        console.log('2. Check .env credentials (host, user, password)');
        console.log('3. Ensure SSL is enabled (required for cloud DB)');

        return false;
    }
};

testConnection();

module.exports = promisePool;