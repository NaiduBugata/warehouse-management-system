const mysql = require('mysql2');
require('dotenv').config();

// Create Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'roott',  // Change if you set a password
    database: process.env.DB_NAME || 'warehouse_management'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.sqlMessage);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL Database');
});

module.exports = db;
