import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const env = {};
const envPath = path.join(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) {
      env[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
    }
  });
}

async function checkAdmin() {
  const pool = new Pool({
    host: env.DB_HOST || "localhost",
    port: parseInt(env.DB_PORT || "5432"),
    user: env.DB_USER || "postgres",
    password: env.DB_PASSWORD,
    database: env.DB_NAME || "VainyBliss_db",
  });
  
  try {
    const r = await pool.query("SELECT email, role, is_verified FROM usuarios");
    console.log("Usuarios en DB:", JSON.stringify(r.rows, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

checkAdmin();
