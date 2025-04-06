
# Warehouse Management System

A complete Warehouse Management System built using:

- HTML, CSS, JavaScript (Frontend)
- Node.js, Express.js (Backend)
- MySQL (Database)

---

## Features

- User Authentication (Staff Login & Admin Login)
- Dynamic Dashboard
- Location-based Inventory Management (State & District wise)
- Inventory CRUD Operations (Add, View, Update, Delete)
- Image Upload for Inventory Items
- Sales Management
- Order Tracking
- Real-time Stock Alerts

---

## Technologies Used

| Technology  | Usage |
|-------------|-----------------|
| HTML, CSS   | Frontend Design |
| JavaScript  | Frontend Logic |
| Node.js & Express | Backend API |
| MySQL       | Database |
| Multer      | Image Upload |
| Bcrypt & JWT | Secure Login |

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup MySQL Database
- Create a database:
```sql
CREATE DATABASE warehouse;
```

- Import SQL file if provided.

- Configure `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=warehouse
JWT_SECRET=your_jwt_secret
```

---

### 4. Run Server
```bash
node server.js
```

Server runs at:
```
http://localhost:5000
```

---

## Folder Structure
```
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── inventory.html
│   ├── dashboard.html
│   └── login.html
├── routes/
├── db/
├── server.js
├── package.json
├── .env
└── README.md
```

---

## Screenshots

> Add your project screenshots here for better visibility.

---

## Contribution

Pull requests are welcome!

---

## License

This project is for educational purpose only.
