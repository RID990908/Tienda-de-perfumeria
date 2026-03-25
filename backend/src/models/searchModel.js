import pool from "../lib/db";

export async function searchProducts(filters = {}) {
  const {
    q = "",
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    page = 1,
    limit = 10,
    sortBy = "nombre",
    sortOrder = "asc",
  } = filters;

  const validSortFields = ["nombre", "precio", "cantidad", "created_at"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "nombre";
  const order = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;

  const whereConditions = ["activo = TRUE"];
  const params = [];

  if (q && q.trim()) {
    params.push(`%${q}%`);
    whereConditions.push(`(nombre ILIKE $${params.length} OR descripcion ILIKE $${params.length})`);
  }

  if (minPrice > 0) {
    params.push(minPrice);
    whereConditions.push(`precio >= $${params.length}`);
  }

  if (maxPrice < Number.MAX_SAFE_INTEGER) {
    params.push(maxPrice);
    whereConditions.push(`precio <= $${params.length}`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const productsQuery = `
    SELECT id, nombre, precio, descripcion, cantidad, imagen, created_at
    FROM productos
    ${whereClause}
    ORDER BY ${sortField} ${order}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const productsResult = await pool.query(productsQuery, [...params, limitNum, offset]);

  const countQuery = `
    SELECT COUNT(*)::int as count
    FROM productos
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);
  const total = countResult.rows[0].count;
  const totalPages = Math.ceil(total / limitNum);

  return {
    products: productsResult.rows,
    pagination: {
      page: pageNum,
      pageSize: limitNum,
      totalItems: total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    }
  };
}

export async function getFeaturedProducts(limit = 10) {
  const query = `
    SELECT id, nombre, precio, descripcion, cantidad, imagen
    FROM productos
    WHERE activo = TRUE AND cantidad > 0
    ORDER BY created_at DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);
  return result.rows;
}

export async function getSearchSuggestions(q, limit = 5) {
  if (!q || q.length < 2) return [];

  const query = `
    SELECT nombre
    FROM productos
    WHERE activo = TRUE AND nombre ILIKE $1
    LIMIT $2
  `;

  const result = await pool.query(query, [`%${q}%`, limit]);
  return result.rows.map(row => row.nombre);
}

export async function getProductsByTag(tag, limit = 10, offset = 0) {
  const query = `
    SELECT id, nombre, precio, descripcion, cantidad, imagen
    FROM productos
    WHERE activo = TRUE AND descripcion ILIKE $1
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [`%${tag}%`, limit, offset]);
  return result.rows;
}

export async function getSimilarProducts(productId, limit = 5) {
  const productQuery = "SELECT nombre FROM productos WHERE id = $1";
  const productResult = await pool.query(productQuery, [productId]);

  if (productResult.rows.length === 0) return [];

  const { nombre } = productResult.rows[0];
  const palabraClave = nombre.split(" ")[0];

  const similarQuery = `
    SELECT id, nombre, precio, descripcion, cantidad, imagen
    FROM productos
    WHERE id != $1 AND activo = TRUE AND nombre ILIKE $2
    LIMIT $3
  `;

  const result = await pool.query(similarQuery, [productId, `%${palabraClave}%`, limit]);
  return result.rows;
}
