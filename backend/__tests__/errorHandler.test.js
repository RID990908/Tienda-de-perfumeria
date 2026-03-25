import {
  AppError,
  ErrorTypes,
  handleError,
  handleSuccess,
  validateWithSchema,
} from "../src/lib/errorHandler";
import { loginSchema } from "../src/lib/validationSchemas";

describe("Error Handler", () => {
  describe("AppError", () => {
    it("debe crear un error con propiedades correctas", () => {
      const error = new AppError(
        "Test error",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.type).toBe(ErrorTypes.VALIDATION_ERROR);
      expect(error.timestamp).toBeDefined();
    });

    it("debe heredar de Error", () => {
      const error = new AppError("Test", 500);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe("handleError", () => {
    it("debe retornar 500 para errores desconocidos", () => {
      const error = new Error("Unknown error");
      const response = handleError(error);

      expect(response.status).toBe(500);
    });

    it("debe retornar statusCode de AppError", () => {
      const appError = new AppError("Not found", 404, ErrorTypes.NOT_FOUND);
      const response = handleError(appError);

      expect(response.status).toBe(404);
    });
  });

  describe("handleSuccess", () => {
    it("debe crear respuesta de éxito", () => {
      const data = { id: 1, name: "Test" };
      const response = handleSuccess(data, 200, "Success");

      expect(response.status).toBe(200);
    });
  });

  describe("validateWithSchema", () => {
    it("debe validar datos correctos", () => {
      const validData = {
        email: "test@vainybliss.com",
        password: "Password123",
      };

      const result = validateWithSchema(loginSchema, validData);
      expect(result.email).toBe("test@vainybliss.com");
    });

    it("debe lanzar AppError con datos inválidos", () => {
      const invalidData = {
        email: "invalid",
        password: "Pass",
      };

      expect(() => validateWithSchema(loginSchema, invalidData)).toThrow(
        AppError,
      );
    });
  });
});
