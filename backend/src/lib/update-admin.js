import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Manual .env loader
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

async function updateAdmin() {
  const email = "lilianafernandez@gmail.com";
  const password = "Lili**240415";
  
  if (!env.DB_PASSWORD) {
    console.error("❌ Error: DB_PASSWORD no encontrada en .env");
    process.exit(1);
  }

  const pool = new Pool({
    host: env.DB_HOST || "localhost",
    port: parseInt(env.DB_PORT || "5432"),
    user: env.DB_USER || "postgres",
    password: env.DB_PASSWORD,
    database: env.DB_NAME || "VainyBliss_db",
  });
  
  try {
    const hash = await bcrypt.hash(password, 10);
    console.log(`⏳ Actualizando admin a: ${email}...`);

    // Insert or update admin
    await pool.query(`
      INSERT INTO usuarios (email, password, role, is_verified)
      VALUES ($1, $2, 'admin', TRUE)
      ON CONFLICT (email) DO UPDATE 
      SET password = $2, role = 'admin', is_verified = TRUE
    `, [email, hash]);

    // Remove old test admin
    await pool.query("DELETE FROM usuarios WHERE email = 'admin@vainybliss.com'");
    
    console.log(`✅ Admin ${email} configurado exitosamente.`);
    console.log(`Hash: ${hash}`);

  } catch (error) {
    console.error("❌ ERROR:", error.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

updateAdmin();
