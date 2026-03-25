import pool from "../lib/db";




export async function getCart() {
  const query = `
    SELECT
      c.id,
      c.cantidad,
      p.id AS id_producto,
      p.nombre,
      p.precio,
      (c.cantidad * p.precio) AS subtotal,
      p.cantidad AS stock_disponible
    FROM carrito c
    JOIN productos p ON c.id_producto = p.id
    ORDER BY c.agregado_en DESC
  `;

  const result = await pool.query(query);
  return result.rows;
}

export async function getCartTotal() {
  const query = `
    SELECT
      COUNT(DISTINCT c.id_producto)::int AS num_items,
      COALESCE(SUM(c.cantidad), 0)::int AS total_cantidad,
      COALESCE(SUM(c.cantidad * p.precio), 0)::float AS total_general,
      COALESCE(SUM(c.cantidad * p.precio * 0.16), 0)::float AS impuesto_estimado
    FROM carrito c
    JOIN productos p ON c.id_producto = p.id
  `;

  const result = await pool.query(query);
  return result.rows[0];
}

export async function addToCart(
  id_producto,
  cantidad,
  maxQuantity = 100,
) {
  const productQuery =
    "SELECT id, nombre, precio, cantidad AS stock FROM productos WHERE id = $1";
  const productResult = await pool.query(productQuery, [id_producto]);

  if (productResult.rows.length === 0) {
    throw new Error("El producto no existe");
  }

  const product = productResult.rows[0];

  if (product.stock < cantidad) {
    throw new Error(
      `No hay suficiente stock. Maximo disponible: ${product.stock}`,
    );
  }

  if (cantidad > maxQuantity) {
    throw new Error(
      `No puedes anadir mas de ${maxQuantity} unidades del mismo producto`,
    );
  }

  const checkQuery = "SELECT id, cantidad FROM carrito WHERE id_producto = $1";
  const checkResult = await pool.query(checkQuery, [id_producto]);

  if (checkResult.rows.length > 0) {
    const cartId = checkResult.rows[0].id;
    const currentQuantity = checkResult.rows[0].cantidad;
    const newQuantity = currentQuantity + cantidad;

    if (newQuantity > product.stock) {
      throw new Error(
        `No hay suficiente stock. Maximo disponible: ${product.stock}`,
      );
    }

    const updateQuery = `
      UPDATE carrito
      SET cantidad = $1, agregado_en = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, id_producto, cantidad
    `;
    const result = await pool.query(updateQuery, [newQuantity, cartId]);
    return result.rows[0];
  }

  const insertQuery = `
    INSERT INTO carrito (id_producto, cantidad, agregado_en)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    RETURNING id, id_producto, cantidad
  `;
  const result = await pool.query(insertQuery, [id_producto, cantidad]);
  return result.rows[0];
}

export async function removeFromCart(
  id_carrito,
) {
  const query =
    "DELETE FROM carrito WHERE id = $1 RETURNING id, id_producto, cantidad";
  const result = await pool.query(query, [id_carrito]);

  if (result.rows.length === 0) {
    throw new Error("Item del carrito no encontrado");
  }

  return result.rows[0];
}

export async function clearCart() {
  const query = `
    WITH deleted AS (
      DELETE FROM carrito
      RETURNING 1
    )
    SELECT COUNT(*)::int AS deleted_count FROM deleted
  `;
  const result = await pool.query(query);
  return result.rows[0];
}

export async function updateCartItemQuantity(
  id_carrito,
  newQuantity,
) {
  const cartQuery = "SELECT id_producto FROM carrito WHERE id = $1";
  const cartResult = await pool.query(cartQuery, [id_carrito]);
  if (cartResult.rows.length === 0) throw new Error("Item no encontrado");
  const id_producto = cartResult.rows[0].id_producto;
  const productQuery = "SELECT cantidad FROM productos WHERE id = $1";
  const productResult = await pool.query(productQuery, [id_producto]);
  const stock = productResult.rows[0].cantidad;

  if (newQuantity > stock) {
    throw new Error(
      `Stock insuficiente. Disponible: ${stock}, Solicitado: ${newQuantity}`,
    );
  }

  const updateQuery = `
    UPDATE carrito
    SET cantidad = $1
    WHERE id = $2
    RETURNING id, id_producto, cantidad
  `;
  const result = await pool.query(updateQuery, [newQuantity, id_carrito]);
  return result.rows[0];
}

export async function getCartSummary() {
  const items = await getCart();
  const totals = await getCartTotal();

  return {
    items,
    summary: {
      ...totals,
      impuesto_estimado: Math.round((totals.impuesto_estimado || 0) * 100) / 100,
      total_con_impuesto: Math.round((Number(totals.total_general || 0) + Number(totals.impuesto_estimado || 0)) * 100) / 100,
    },
  };
}


