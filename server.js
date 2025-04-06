require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ✅ Serve uploaded images

// ✅ Setup Storage for Image Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 📌 Save images inside 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 📌 Unique filename
    }
});
const upload = multer({ storage: storage });

// ✅ Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'roott',
    database: process.env.DB_NAME || 'warehouse_db'
});

db.connect(err => {
    if (err) {
        console.error("❌ Database Connection Failed:", err);
        process.exit(1);
    }
    console.log("✅ Connected to Database");
});

// 📌 1️⃣ User Login API
app.post('/login', (req, res) => {
    console.log("🔍 Login Attempt:", req.body);

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: "Login successful", token });
    });
});

app.get("/inventory", (req, res) => {
    const { state, district } = req.query;

    // ✅ Ensure state and district are provided
    if (!state || !district) {
        return res.status(400).json({ message: "State and district are required" });
    }

    const query = "SELECT * FROM inventory WHERE state = ? AND district = ?";
    db.query(query, [state, district], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results); // ✅ Send filtered inventory data
    });
});



// 📌 3️⃣ Add New Item with Image Upload
app.post("/inventory", upload.single("image"), (req, res) => {
    console.log("Received Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const { item_name, category, quantity, price } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!item_name || !category || !quantity || !price) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = "INSERT INTO inventory (item_name, category, quantity, price, image_url) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [item_name, category, quantity, price, image_url], (err) => {
        if (err) {
            console.error("❌ Error Adding Item:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Item added successfully", image_url });
    });
});

// 📌 4️⃣ Delete an Item
app.delete("/inventory/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM inventory WHERE id=?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Item deleted successfully" });
    });
});

// 📌 5️⃣ Fetch Dashboard Data
app.get("/dashboard", (req, res) => {
    const { state, district } = req.query;
    let conditions = [];
    let params = [];

    if (state) {
        conditions.push("state = ?");
        params.push(state);
    }
    if (district) {
        conditions.push("district = ?");
        params.push(district);
    }

    let query = `
        SELECT 
            COALESCE(SUM(quantity), 0) AS totalInventory,
            COALESCE(SUM(price * quantity), 0) AS totalSales,
            (SELECT COUNT(*) FROM sales) AS totalSalesCount,
            (SELECT COUNT(*) FROM orders WHERE status = 'Pending') AS pendingOrders,
            (SELECT COUNT(*) FROM inventory WHERE quantity < 5) AS stockAlerts
        FROM inventory
        ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
    `;

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results[0]);
    });
});

// 📌 6️⃣ Fetch All Sales Data
app.get("/sales", (req, res) => {
    db.query("SELECT * FROM sales", (err, results) => {
        if (err) {
            console.error("❌ Error Fetching Sales:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});

// 📌 7️⃣ Add a New Sale
app.post("/sales", (req, res) => {
    const { item_id, quantity, total_price } = req.body;

    if (!item_id || !quantity || !total_price) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = "INSERT INTO sales (item_id, quantity, total_price) VALUES (?, ?, ?)";
    db.query(query, [item_id, quantity, total_price], (err, result) => {
        if (err) {
            console.error("❌ Error Adding Sale:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Sale added successfully", id: result.insertId });
    });
});

// 📌 8️⃣ Update Dashboard Sales Dynamically
app.get("/dashboard/sales", (req, res) => {
    const query = `SELECT COALESCE(SUM(total_price), 0) AS totalSales FROM sales`;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results[0]);
    });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
