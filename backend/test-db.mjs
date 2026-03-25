import { Pool } from 'pg';

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin123",
  database: "VainyBliss_db",
});

async function test() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'productos'
    `);
    console.log("Columns:", res.rows.map(r => r.column_name).join(", "));
    
    // Test the createProduct error explicitly
    const query = `
      INSERT INTO productos (nombre, categoria, precio, descripcion, cantidad, imagen, activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const insertRes = await pool.query(query, ['test', 'test', 10, 'test', 10, '', true]);
    console.log('Inserted successfully!');
    await pool.query('DELETE FROM productos WHERE id = $1', [insertRes.rows[0].id]);
  } catch (err) {
    console.error('DB ERROR:', err.message);
  } finally {
    pool.end();
  }
}

test();
