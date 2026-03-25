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
    console.log("Adding missing columns to productos table...");
    await pool.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria VARCHAR(255) DEFAULT 'Sin categoría'`);
    await pool.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen VARCHAR(2048) DEFAULT ''`);
    console.log("Columns added successfully.");
    
    // Also, create a trigger to auto-insert into inventario when a product is created
    console.log("Checking inventario trigger...");
    await pool.query(`
      CREATE OR REPLACE FUNCTION auto_insert_inventario()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO inventario (id_producto, stock)
        VALUES (NEW.id, NEW.cantidad);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await pool.query(`
      DROP TRIGGER IF EXISTS tr_auto_insert_inventario ON productos;
      CREATE TRIGGER tr_auto_insert_inventario
      AFTER INSERT ON productos
      FOR EACH ROW
      EXECUTE FUNCTION auto_insert_inventario();
    `);
    console.log("Inventario trigger created successfully.");
    
  } catch (err) {
    console.error("DB ERROR details:", err);
  } finally {
    pool.end();
  }
}

run();
