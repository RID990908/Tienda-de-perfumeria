import pool from "../lib/db";



export const getActiveProducts = async () => {
  const query = `
    SELECT id, nombre, categoria, precio, descripcion, (cantidad > 0) as "inStock", imagen
    FROM productos
    WHERE activo = TRUE
    ORDER BY id ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getAllProducts = async () => {
  const query = `
    SELECT id, nombre, categoria, precio, descripcion, cantidad, imagen, activo, created_at
    FROM productos
    WHERE activo = TRUE
    ORDER BY id DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getProductById = async (id) => {
  const query = "SELECT id, nombre, categoria, precio, descripcion, (cantidad > 0) as \"inStock\", imagen FROM productos WHERE id = $1 AND activo = TRUE";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const createProduct = async (data) => {
  const query = `
    INSERT INTO productos (nombre, categoria, precio, descripcion, cantidad, imagen, activo)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const { nombre, categoria, precio, descripcion, cantidad, imagen, activo } = data;
  const result = await pool.query(query, [
    nombre,
    categoria,
    precio,
    descripcion,
    cantidad,
    imagen,
    activo !== undefined ? activo : true,
  ]);
  return result.rows[0];
};

export const updateProduct = async (
  id,
  data,
) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE productos
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteProduct = async (
  id,
) => {
  try {
    const query = "DELETE FROM productos WHERE id = $1 RETURNING id, nombre";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    // If product has historical order references (FK 23503), perform a soft delete.
    if (error?.code === "23503") {
      await pool.query("DELETE FROM carrito WHERE id_producto = $1", [id]);

      const softDeleteQuery = `
        UPDATE productos
        SET activo = FALSE, cantidad = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, nombre, activo
      `;
      const softResult = await pool.query(softDeleteQuery, [id]);
      if (!softResult.rows[0]) {
        return null;
      }

      return {
        ...softResult.rows[0],
        softDeleted: true,
      };
    }

    throw error;
  }
};

export const updateStock = async (
  id,
  newStock,
) => {
  const query = `
    UPDATE productos
    SET cantidad = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, nombre, cantidad
  `;
  const result = await pool.query(query, [newStock, id]);
  return result.rows[0] || null;
};


