import pool from "./db.js";

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tablas encontradas en la base de datos:", result.rows.map(r => r.table_name));
    
    if (result.rows.length === 0) {
      console.log("¡ADVERTENCIA! La base de datos está VACÍA.");
    }
  } catch (error) {
    console.error("Error al conectar o consultar tablas:", error.message);
  } finally {
    process.exit();
  }
}

checkTables();
