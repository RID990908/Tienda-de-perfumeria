-- =====================================================
-- SCHEMA DE BASE DE DATOS - VainyBliss
-- Sistema de E-commerce Completo
-- =====================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- =====================================================
-- SCHEMA DE BASE DE DATOS - VainyBliss
-- Sistema de E-commerce Completo
-- =====================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role ON usuarios(role);

-- =====================================================
-- TABLA: PASSWORD RESETS
-- =====================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);

-- =====================================================
-- TABLA: VERIFICATION TOKENS
-- =====================================================
CREATE TABLE IF NOT EXISTS verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_tokens_hash ON verification_tokens(token_hash);

-- =====================================================
-- TABLA: PRODUCTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(255) DEFAULT 'Sin categoría',
  precio DECIMAL(10, 2) NOT NULL CHECK (precio > 0),
  descripcion TEXT,
  cantidad INT DEFAULT 0 CHECK (cantidad >= 0),
  imagen VARCHAR(2048) DEFAULT '',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_productos_activo ON productos(activo);

-- =====================================================
-- TABLA: CARRITO
-- =====================================================
CREATE TABLE IF NOT EXISTS carrito (
  id SERIAL PRIMARY KEY,
  id_producto INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  agregado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carrito_producto ON carrito(id_producto);
CREATE INDEX idx_carrito_fecha ON carrito(agregado_en);

-- =====================================================
-- TABLA: ÓRDENES
-- =====================================================
CREATE TABLE IF NOT EXISTS ordenes (
  id SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (
    estado IN ('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado')
  ),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ordenes_usuario ON ordenes(id_usuario);
CREATE INDEX idx_ordenes_estado ON ordenes(estado);
CREATE INDEX idx_ordenes_fecha ON ordenes(created_at);

-- =====================================================
-- TABLA: ITEMS DE ÓRDENES
-- =====================================================
CREATE TABLE IF NOT EXISTS orden_items (
  id SERIAL PRIMARY KEY,
  id_orden INT NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  id_producto INT NOT NULL REFERENCES productos(id),
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orden_items_orden ON orden_items(id_orden);
CREATE INDEX idx_orden_items_producto ON orden_items(id_producto);

-- =====================================================
-- TABLA: INVENTARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS inventario (
  id SERIAL PRIMARY KEY,
  id_producto INT NOT NULL UNIQUE REFERENCES productos(id) ON DELETE CASCADE,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

  ('MacBook Pro 16', 2499.99, 'Laptop profesional para creadores', 20),
  ('AirPods Pro', 249.99, 'Auriculares inalámbricos con cancelación de ruido', 100),
  ('iPad Air', 599.99, 'Tablet versátil para trabajo y entretenimiento', 35)
ON CONFLICT DO NOTHING;

-- Insertar inventario
INSERT INTO inventario (id_producto, stock) 
SELECT id, cantidad FROM productos
ON CONFLICT DO NOTHING;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Órdenes con detalles del usuario
CREATE OR REPLACE VIEW v_ordenes_detalladas AS
SELECT 
  o.id,
  o.id_usuario,
  u.email AS usuario_email,
  o.total,
  o.estado,
  COUNT(oi.id) AS num_items,
  SUM(oi.cantidad) AS total_cantidad,
  o.created_at,
  o.updated_at
FROM ordenes o
JOIN usuarios u ON o.id_usuario = u.id
LEFT JOIN orden_items oi ON o.id = oi.id_orden
GROUP BY o.id, u.id, u.email;

-- Vista: Productos más vendidos
CREATE OR REPLACE VIEW v_productos_mas_vendidos AS
SELECT 
  p.id,
  p.nombre,
  COUNT(oi.id) AS veces_vendido,
  SUM(oi.cantidad) AS total_vendido,
  SUM(oi.cantidad * oi.precio_unitario) AS ingresos_totales
FROM productos p
LEFT JOIN orden_items oi ON p.id = oi.id_producto
GROUP BY p.id, p.nombre
ORDER BY total_vendido DESC;

-- Vista: Stock bajo (menos de 10 unidades)
CREATE OR REPLACE VIEW v_stock_bajo AS
SELECT 
  p.id,
  p.nombre,
  p.cantidad AS stock_actual,
  (SELECT COUNT(*) FROM orden_items WHERE id_producto = p.id AND DATE(created_at) >= CURRENT_DATE - INTERVAL '30 day') AS vendidas_ultimas_30_dias
FROM productos p
WHERE p.cantidad < 10 AND p.activo = TRUE
ORDER BY p.cantidad ASC;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Actualizar updated_at en usuarios
CREATE OR REPLACE FUNCTION update_usuarios_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_usuarios_timestamp
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_usuarios_timestamp();

-- Trigger: Actualizar updated_at en productos
CREATE OR REPLACE FUNCTION update_productos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_productos_timestamp
BEFORE UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION update_productos_timestamp();

-- Trigger: Actualizar updated_at en órdenes
CREATE OR REPLACE FUNCTION update_ordenes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_ordenes_timestamp
BEFORE UPDATE ON ordenes
FOR EACH ROW
EXECUTE FUNCTION update_ordenes_timestamp();

-- Trigger: Actualizar updated_at en inventario
CREATE OR REPLACE FUNCTION update_inventario_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_inventario_timestamp
BEFORE UPDATE ON inventario
FOR EACH ROW
EXECUTE FUNCTION update_inventario_timestamp();

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento: Obtener resumen de ventas
CREATE OR REPLACE FUNCTION get_sales_summary(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 day',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_ordenes BIGINT,
  ingresos_totales DECIMAL,
  promedio_por_orden DECIMAL,
  cliente_top VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(o.id)::BIGINT AS total_ordenes,
    SUM(o.total)::DECIMAL AS ingresos_totales,
    AVG(o.total)::DECIMAL AS promedio_por_orden,
    (
      SELECT u.email 
      FROM usuarios u
      JOIN ordenes o2 ON u.id = o2.id_usuario
      WHERE DATE(o2.created_at) BETWEEN p_start_date AND p_end_date
      GROUP BY u.id, u.email
      ORDER BY SUM(o2.total) DESC
      LIMIT 1
    ) AS cliente_top
  FROM ordenes o
  WHERE DATE(o.created_at) BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento: Cancelar orden con rollback
CREATE OR REPLACE FUNCTION cancel_order_safe(p_order_id INT)
RETURNS TABLE (success BOOLEAN, message VARCHAR) AS $$
DECLARE
  v_estado VARCHAR;
BEGIN
  BEGIN
    -- Obtener estado actual
    SELECT estado INTO v_estado FROM ordenes WHERE id = p_order_id;
    
    IF v_estado IS NULL THEN
      RETURN QUERY SELECT FALSE, 'Orden no encontrada'::VARCHAR;
      RETURN;
    END IF;
    
    IF v_estado != 'pendiente' THEN
      RETURN QUERY SELECT FALSE, ('No se puede cancelar orden en estado: ' || v_estado)::VARCHAR;
      RETURN;
    END IF;
    
    -- Devolver stock
    UPDATE productos p
    SET cantidad = cantidad + oi.cantidad
    FROM orden_items oi
    WHERE oi.id_orden = p_order_id AND p.id = oi.id_producto;
    
    -- Actualizar estado
    UPDATE ordenes SET estado = 'cancelado' WHERE id = p_order_id;
    
    RETURN QUERY SELECT TRUE, 'Orden cancelada exitosamente'::VARCHAR;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, ('Error: ' || SQLERRM)::VARCHAR;
  END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- NOTAS DE CONFIGURACIÓN
-- =====================================================
/*
1. Asegurar que PostgreSQL está ejecutándose en localhost:5432
2. Crear base de datos: CREATE DATABASE vainybliss;
3. Ejecutar este script en la base de datos vainybliss
4. Configurar las variables de entorno en .env
5. El pool de conexiones está configurado con 10 conexiones máximo
6. Los timestamps están en UTC
7. Las transacciones se usan en operaciones críticas (órdenes)
*/
