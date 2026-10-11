
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the login page and its assets from the public directory.
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof password !== "string" || !password ||
    !["user", "admin"].includes(role)
  ) {
    return res.status(400).send("Please provide a name, email, password, and valid role.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), hashedPassword, role]
    );
    res.status(201).send("Registration successful. You can now log in.");
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).send("An account with that email already exists.");
    }
    console.error("Could not register user:", error.code || error.name, error.message);
    res.status(500).send("Registration failed. Please try again.");
  }
});

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "login_system",
  waitForConnections: true,
  connectionLimit: 10
});

async function startServer() {
  try {
    await pool.query("SELECT 1");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Could not initialize MySQL:", error.code || error.name, error.message);
    process.exit(1);
  }
}

startServer();
