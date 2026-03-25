import { Pool } from 'pg';

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin123",
  database: "VainyBliss_db",
});

async function run() {
  try {
    console.log("Adding created_at and updated_at if missing...");
    await pool.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await pool.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log("Columns added successfully.");
  } catch (err) {
    console.error("DB ERROR details:", err.message);
  } finally {
    pool.end();
  }
}

run();
