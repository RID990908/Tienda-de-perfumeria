import fs from 'fs';
import { Pool } from 'pg';

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

async function runTest() {
  try {
    const query = `
      SELECT id, nombre, categoria, precio, descripcion, cantidad, imagen, activo, created_at
      FROM productos
      ORDER BY id DESC
      LIMIT 1
    `;
    const res = await pool.query(query);
    console.log("Success! Row:", res.rows[0]?.id || "empty");
  } catch(e) {
    console.error("DB Error:", e);
  } finally {
    pool.end();
  }
}

runTest();
