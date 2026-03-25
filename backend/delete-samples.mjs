import { Pool } from 'pg';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').trim().split('\n');
env.forEach(line => {
  const [key, ...vals] = line.split('=');
  const cleanKey = key?.trim();
  if (cleanKey && vals.length) process.env[cleanKey] = vals.join('=').trim().replace(/['"\r]/g, '');
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function run() {
  try {
    const idsResult = await pool.query(`SELECT id FROM productos WHERE nombre IN ('MacBook Pro 16', 'AirPods Pro', 'iPad Air', 'test')`);
    const ids = idsResult.rows.map(r => r.id);
    if (ids.length > 0) {
      await pool.query(`DELETE FROM inventario WHERE id_producto = ANY($1::int[])`, [ids]);
      const result = await pool.query(`DELETE FROM productos WHERE id = ANY($1::int[])`, [ids]);
      console.log(`Deleted ${result.rowCount} sample products.`);
    } else {
      console.log(`No sample products found.`);
    }
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    pool.end();
  }
}

run();
