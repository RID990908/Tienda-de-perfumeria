import pool from "../lib/db";



export async function getAllOrders(filters = {}) {
  let query = `
    SELECT 
      o.id,
      o.id_usuario,
      o.total,
      o.estado,
      o.notas,
      o.created_at,
      COUNT(oi.id)::int AS num_items
    FROM ordenes o
    LEFT JOIN orden_items oi ON o.id = oi.id_orden
  `;

  const conditions = [];
  const params = [];

  if (filters.estado) {
    conditions.push(`o.estado = $${params.length + 1}`);
    params.push(filters.estado);
  }

  if (filters.id_usuario) {
    conditions.push(`o.id_usuario = $${params.length + 1}`);
    params.push(filters.id_usuario);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
}

export async function getOrderById(id_orden) {
  const orderQuery = `
    SELECT 
      o.id,
      o.id_usuario,
      o.total,
      o.estado,
      o.notas,
      o.created_at,
      o.updated_at
    FROM ordenes o
    WHERE o.id = $1
  `;

  const orderResult = await pool.query(orderQuery, [id_orden]);

  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];

  const itemsQuery = `
    SELECT 
      oi.id,
      oi.id_producto,
      oi.cantidad,
      oi.precio_unitario,
      (oi.cantidad * oi.precio_unitario) AS subtotal,
      p.nombre
    FROM orden_items oi
    JOIN productos p ON oi.id_producto = p.id
    WHERE oi.id_orden = $1
  `;

  const itemsResult = await pool.query(itemsQuery, [id_orden]);

  return {
    ...order,
    items: itemsResult.rows,
  };
}

export async function getOrdersByUser(id_usuario) {
  const query = `
    SELECT 
      o.id,
      o.total,
      o.estado,
      o.created_at,
      COUNT(oi.id)::int AS num_items
    FROM ordenes o
    LEFT JOIN orden_items oi ON o.id = oi.id_orden
    WHERE o.id_usuario = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  const result = await pool.query(query, [id_usuario]);
  return result.rows;
}

export async function createOrder(
  id_usuario,
  items,
  total,
  notas = null,
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const item of items) {
      const stockQuery =
        "SELECT cantidad FROM productos WHERE id = $1 FOR UPDATE";
      const stockResult = await client.query(stockQuery, [item.id_producto]);

      if (stockResult.rows.length === 0) {
        throw new Error(`Producto ${item.id_producto} no encontrado`);
      }

      const availableStock = stockResult.rows[0].cantidad;

      if (availableStock < item.cantidad) {
        throw new Error(
          `Stock insuficiente para producto ${item.id_producto}. Disponible: ${availableStock}`,
        );
      }
    }

    const orderQuery = `
      INSERT INTO ordenes (id_usuario, total, estado, notas, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, id_usuario, total, estado, created_at
    `;

    const orderResult = await client.query(orderQuery, [
      id_usuario,
      total,
      "pendiente",
      notas,
    ]);

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      const itemQuery = `
        INSERT INTO orden_items (id_orden, id_producto, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(itemQuery, [
        orderId,
        item.id_producto,
        item.cantidad,
        item.precio,
      ]);

      const updateStockQuery = `
        UPDATE productos
        SET cantidad = cantidad - $1
        WHERE id = $2
      `;
      await client.query(updateStockQuery, [item.cantidad, item.id_producto]);
    }

    await client.query("DELETE FROM carrito");

    await client.query("COMMIT");

    return orderResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(
  id_orden,
  nuevoEstado,
) {
  const estadosValidos = [
    "pendiente",
    "procesando",
    "enviado",
    "entregado",
    "cancelado",
  ];

  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error(`Estado inválido: ${nuevoEstado}`);
  }

  const query = `
    UPDATE ordenes
    SET estado = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, estado, updated_at
  `;

  const result = await pool.query(query, [nuevoEstado, id_orden]);

  if (result.rows.length === 0) {
    throw new Error("Orden no encontrada");
  }

  return result.rows[0];
}

export async function cancelOrder(id_orden) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderQuery =
      "SELECT id, estado FROM ordenes WHERE id = $1 FOR UPDATE";
    const orderResult = await client.query(orderQuery, [id_orden]);

    if (orderResult.rows.length === 0) {
      throw new Error("Orden no encontrada");
    }

    const orden = orderResult.rows[0];

    if (orden.estado !== "pendiente") {
      throw new Error(
        `No se puede cancelar una orden en estado: ${orden.estado}`,
      );
    }

    const itemsQuery =
      "SELECT id_producto, cantidad FROM orden_items WHERE id_orden = $1";
    const itemsResult = await client.query(itemsQuery, [id_orden]);

    for (const item of itemsResult.rows) {
      const updateStockQuery = `
        UPDATE productos
        SET cantidad = cantidad + $1
        WHERE id = $2
      `;
      await client.query(updateStockQuery, [item.cantidad, item.id_producto]);
    }

    const updateQuery = `
      UPDATE ordenes
      SET estado = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, estado
    `;

    const result = await client.query(updateQuery, ["cancelado", id_orden]);

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getOrderStatistics() {
  const query = `
    SELECT 
      COUNT(DISTINCT o.id)::int AS total_ordenes,
      SUM(CASE WHEN o.estado = 'pendiente' THEN 1 ELSE 0 END)::int AS ordenes_pendientes,
      SUM(CASE WHEN o.estado = 'procesando' THEN 1 ELSE 0 END)::int AS ordenes_procesando,
      SUM(CASE WHEN o.estado = 'entregado' THEN 1 ELSE 0 END)::int AS ordenes_entregadas,
      SUM(CASE WHEN o.estado = 'cancelado' THEN 1 ELSE 0 END)::int AS ordenes_canceladas,
      COALESCE(SUM(o.total), 0)::float AS ingresos_totales,
      COALESCE(AVG(o.total), 0)::float AS promedio_por_orden
    FROM ordenes o
  `;

  const result = await pool.query(query);
  return result.rows[0];
}


