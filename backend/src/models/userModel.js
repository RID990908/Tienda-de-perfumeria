import pool from "../lib/db";


export const getUserByEmail = async (email) => {
  const query = "SELECT * FROM usuarios WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

export const getUserById = async (id) => {
  const query =
    "SELECT id, email, role, is_verified, created_at, updated_at FROM usuarios WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};


export const getAllUsers = async (
  limit = 10,
  offset = 0,
) => {
  const query = `
    SELECT id, email, role, is_verified, created_at, updated_at 
    FROM usuarios 
    ORDER BY created_at DESC 
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM usuarios"
  );
  const total = parseInt(countResult.rows[0].count);

  return {
    users: result.rows,
    total,
    totalPages: Math.ceil(total / limit),
    page: Math.floor(offset / limit) + 1,
    pageSize: limit,
  };
};

export const createUser = async (
  email,
  hashedPassword,
  role = "client",
) => {
  const query = `
    INSERT INTO usuarios (email, password, role, is_verified, created_at, updated_at)
    VALUES ($1, $2, $3, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id, email, role, created_at
  `;
  const result = await pool.query(query, [email, hashedPassword, role]);
  return result.rows[0];
};

export const updatePassword = async (
  id,
  newHashedPassword,
) => {
  const query = `
    UPDATE usuarios
    SET password = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, email, updated_at
  `;
  const result = await pool.query(query, [newHashedPassword, id]);
  return result.rows[0] || null;
};

export const verifyUser = async (id) => {
  const query = `
    UPDATE usuarios
    SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, email, is_verified
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const updateUserRole = async (
  id,
  newRole,
) => {
  const query = `
    UPDATE usuarios
    SET role = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, email, role
  `;
  const result = await pool.query(query, [newRole, id]);
  return result.rows[0] || null;
};

export const deleteUser = async (
  id,
) => {
  const query = "DELETE FROM usuarios WHERE id = $1 RETURNING id, email";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const updateUserProfile = async (
  id,
  updates,
) => {
  const allowedFields = ["email", "phone", "address"];
  const fields = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== null && value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error("No hay campos válidos para actualizar");
  }

  values.push(id);
  const query = `
    UPDATE usuarios
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING id, email, phone, address, updated_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const emailExists = async (email) => {
  const query = "SELECT id FROM usuarios WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows.length > 0;
};


