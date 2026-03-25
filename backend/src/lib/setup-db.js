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

async function setupDatabase() {
  console.log("--- INICIANDO CONFIGURACIÓN PASO A PASO ---");
  
  const pool = new Pool({
    host: env.DB_HOST || "localhost",
    port: parseInt(env.DB_PORT || "5432"),
    user: env.DB_USER || "postgres",
    password: env.DB_PASSWORD,
    database: env.DB_NAME || "VainyBliss_db",
  });
  
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Conexión establecida.");

    // Dividir el SQL por marcas de tabla
    const schemaPath = path.join(__dirname, "../../DATABASE_SCHEMA.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    
    // Un truco sucio: separar por 'CREATE TABLE'
    const commands = schemaSql.split(";");

    console.log(`🛠️ Procesando ${commands.length} comandos SQL...`);
    
    for (let cmd of commands) {
      cmd = cmd.trim();
      if (!cmd) continue;
      
      try {
        await pool.query(cmd);
        // Log solo si crea una tabla
        if (cmd.toUpperCase().includes("CREATE TABLE")) {
          const tableName = cmd.match(/IF NOT EXISTS\s+(\w+)/i)?.[1] || "tabla";
          console.log(`📦 Verificada/Creada: ${tableName}`);
        }
      } catch (e) {
        // Ignorar errores de "ya existe" si no es IF NOT EXISTS
        if (!e.message.includes("already exists")) {
          console.warn(`⚠️ Aviso en comando [${cmd.substring(0, 50)}...]: ${e.message}`);
        }
      }
    }

    // Parches de columnas
    const patches = [
      { table: "usuarios", column: "is_verified", type: "BOOLEAN DEFAULT FALSE" },
      { table: "productos", column: "activo", type: "BOOLEAN DEFAULT TRUE" },
      { table: "productos", column: "cantidad", type: "INT DEFAULT 0" },
    ];

    for (const patch of patches) {
      try {
        await pool.query(`ALTER TABLE ${patch.table} ADD COLUMN IF NOT EXISTS ${patch.column} ${patch.type}`);
        console.log(`✅ Columna '${patch.column}' en '${patch.table}' lista.`);
      } catch (e) {
        console.error(`❌ Error en parche ${patch.table}.${patch.column}: ${e.message}`);
      }
    }

    console.log("--- PROCESO FINALIZADO ---");

  } catch (error) {
    console.error("❌ ERROR GENERAL:");
    console.error(error.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

setupDatabase();
