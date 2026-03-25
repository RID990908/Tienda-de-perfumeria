import pool from "../lib/db";


export const createVerificationToken = async (
  userId,
  tokenHash,
  type,
  expiresAt,
) => {
  const query = `
    INSERT INTO verification_tokens (user_id, token_hash, type, expires_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, type, expires_at
  `;
  const result = await pool.query(query, [userId, tokenHash, type, expiresAt]);
  return result.rows[0];
};

export const findValidToken = async (
  userId,
  tokenHash,
  type,
) => {
  const query = `
    SELECT id, user_id, type, expires_at, used
    FROM verification_tokens
    WHERE user_id = $1
      AND token_hash = $2
      AND type = $3
      AND used = FALSE
      AND expires_at > CURRENT_TIMESTAMP
    LIMIT 1
  `;
  const result = await pool.query(query, [userId, tokenHash, type]);
  return result.rows[0] || null;
};

export const markTokenUsed = async (id) => {
  const query = `
    UPDATE verification_tokens
    SET used = TRUE
    WHERE id = $1
  `;
  await pool.query(query, [id]);
};

export const markUserTokensUsed = async (
  userId,
  type,
) => {
  const query = `
    UPDATE verification_tokens
    SET used = TRUE
    WHERE user_id = $1 AND type = $2
  `;
  await pool.query(query, [userId, type]);
};


