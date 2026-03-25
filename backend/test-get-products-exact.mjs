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
    const query = `
      SELECT id, nombre, categoria, precio, descripcion, cantidad, imagen, activo, created_at
      FROM productos
      ORDER BY id DESC
      LIMIT 1
    `;
    const result = await pool.query(query);
    console.log(JSON.stringify(result.rows[0], null, 2));
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    pool.end();
  }
}

run();
