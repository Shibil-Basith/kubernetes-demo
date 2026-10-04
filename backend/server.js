const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST || "mysql-service",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rootpass",
  database: process.env.DB_NAME || "shoplite"
};

let pool;

async function initializeDatabase() {
  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 5000
  });

  let lastError;
  for (let i = 1; i <= 30; i++) {
    try {
      const conn = await pool.getConnection();
      await conn.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description VARCHAR(255),
          price DECIMAL(10,2) NOT NULL
        )
      `);

      const [rows] = await conn.query("SELECT COUNT(*) AS count FROM products");
      if (rows[0].count === 0) {
        await conn.query(
          "INSERT INTO products (name, description, price) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)",
          [
            "Laptop", "Developer laptop", 65000,
            "Keyboard", "Mechanical keyboard", 3500,
            "Headphones", "Wireless headphones", 2500
          ]
        );
      }
      conn.release();
      console.log("Connected to MySQL and initialized database.");
      return;
    } catch (err) {
      lastError = err;
      console.log(`Waiting for MySQL... attempt ${i}/30`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw lastError;
}

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "shoplite-backend" });
});

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const [result] = await pool.query(
      "INSERT INTO products (name, description, price) VALUES (?, ?, ?)",
      [name, description, price]
    );
    res.status(201).json({ id: result.insertId, name, description, price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database insert failed" });
  }
});

initializeDatabase()
  .then(() => app.listen(PORT, () => console.log(`Backend listening on ${PORT}`)))
  .catch(err => {
    console.error("Database initialization failed:", err);
    process.exit(1);
  });
