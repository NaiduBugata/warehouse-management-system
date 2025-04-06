const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'roott',  // Use your MySQL password if you have one
    database: 'warehouse_db'
});

const createUser = async () => {
    const username = 'admin';
    const plainPassword = 'admin123';  // The raw password
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash the password

    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(query, [username, hashedPassword], (err, result) => {
        if (err) console.error("❌ Error inserting user:", err);
        else console.log("✅ User created successfully!");
        db.end();
    });
};

createUser();
