/**
 * Jest Setup File
 * Configuración inicial para tests
 */

// Mock variables de entorno
process.env.JWT_SECRET = "test_secret_key_min_32_chars_long!";
process.env.NODE_ENV = "test";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_USER = "postgres";
process.env.DB_PASSWORD = "postgres";
process.env.DB_NAME = "vainybliss_test";

// Suprimir logs en tests (opcional)
// global.console.log = jest.fn();
// global.console.error = jest.fn();
