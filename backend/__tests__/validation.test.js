import {
  loginSchema,
  registerSchema,
  createProductSchema,
  addToCartSchema,
  createOrderSchema,
} from "../src/lib/validationSchemas";

describe("Zod Validation Schemas", () => {
  describe("loginSchema", () => {
    it("debe validar un login correcto", () => {
      const validData = {
        email: "admin@vainybliss.com",
        password: "Password123!",
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it("debe rechazar email invalido", () => {
      const invalidData = {
        email: "notanemail",
        password: "Password123!",
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar contrasena vacia", () => {
      const invalidData = {
        email: "admin@vainybliss.com",
        password: "",
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it("debe convertir email a minusculas", () => {
      const validData = {
        email: "ADMIN@VAINYBLISS.COM",
        password: "Password123!",
      };
      const result = loginSchema.parse(validData);
      expect(result.email).toBe("admin@vainybliss.com");
    });
  });

  describe("registerSchema", () => {
    it("debe validar registro correcto", () => {
      const validData = {
        email: "newuser@vainybliss.com",
        password: "SecurePass123",
        name: "John Doe",
      };
      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it("debe rechazar contrasena sin mayuscula", () => {
      const invalidData = {
        email: "newuser@vainybliss.com",
        password: "securepass123",
        name: "John Doe",
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar contrasena muy corta", () => {
      const invalidData = {
        email: "newuser@vainybliss.com",
        password: "Pass1",
        name: "John Doe",
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });
  });

  describe("createProductSchema", () => {
    it("debe validar un producto correcto", () => {
      const validData = {
        nombre: "Producto Test",
        categoria: "Categoria test",
        precio: 99.99,
        descripcion: "Una descripcion de prueba",
        cantidad: 10,
      };
      expect(() => createProductSchema.parse(validData)).not.toThrow();
    });

    it("debe rechazar precio negativo", () => {
      const invalidData = {
        nombre: "Producto Test",
        categoria: "Categoria test",
        precio: -50,
        descripcion: "Una descripcion",
      };
      expect(() => createProductSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar categoria vacia", () => {
      const invalidData = {
        nombre: "Producto Test",
        categoria: "",
        precio: 10,
      };
      expect(() => createProductSchema.parse(invalidData)).toThrow();
    });

    it("debe usar cantidad por defecto de 0", () => {
      const data = {
        nombre: "Producto Test",
        categoria: "Categoria test",
        precio: 50,
      };
      const result = createProductSchema.parse(data);
      expect(result.cantidad).toBe(0);
    });
  });

  describe("addToCartSchema", () => {
    it("debe validar agregar al carrito correcto", () => {
      const validData = {
        id_producto: 1,
        cantidad: 5,
      };
      expect(() => addToCartSchema.parse(validData)).not.toThrow();
    });

    it("debe usar cantidad por defecto 1", () => {
      const data = {
        id_producto: 1,
      };
      const result = addToCartSchema.parse(data);
      expect(result.cantidad).toBe(1);
    });

    it("debe rechazar cantidad negativa", () => {
      const invalidData = {
        id_producto: 1,
        cantidad: -5,
      };
      expect(() => addToCartSchema.parse(invalidData)).toThrow();
    });
  });

  describe("createOrderSchema", () => {
    it("debe validar una orden correcta", () => {
      const validData = {
        items: [
          { id_producto: 1, cantidad: 2, precio: 50.0 },
          { id_producto: 2, cantidad: 1, precio: 100.0 },
        ],
        total: 200.0,
      };
      expect(() => createOrderSchema.parse(validData)).not.toThrow();
    });

    it("debe rechazar orden sin items", () => {
      const invalidData = {
        items: [],
        total: 0,
      };
      expect(() => createOrderSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar total negativo", () => {
      const invalidData = {
        items: [{ id_producto: 1, cantidad: 1, precio: 50.0 }],
        total: -100.0,
      };
      expect(() => createOrderSchema.parse(invalidData)).toThrow();
    });
  });
});
