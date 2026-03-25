import { NextResponse } from "next/server";

export const ErrorTypes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
};

export const ErrorFriendlyNames = {
  VALIDATION_ERROR: "Error de Validación",
  NOT_FOUND: "No Encontrado",
  UNAUTHORIZED: "No Autorizado",
  FORBIDDEN: "Acceso Prohibido",
  CONFLICT: "Conflicto de Datos",
  INTERNAL_ERROR: "Error de Servidor",
  BAD_REQUEST: "Solicitud Incorrecta",
  DUPLICATE_ENTRY: "Registro Duplicado",
  INVALID_CREDENTIALS: "Credenciales Inválidas",
  INSUFFICIENT_STOCK: "Stock Insuficiente",
};

export class AppError extends Error {
  constructor(
    message,
    statusCode,
    type = ErrorTypes.INTERNAL_ERROR,
    details = null,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const handleError = (error, defaultStatus = 500) => {
  let statusCode = defaultStatus;
  let errorType = ErrorTypes.INTERNAL_ERROR;
  let message = "Error interno del servidor";
  let details = null;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorType = error.type;
    message = error.message;
    details = error.details;
  } else if (error.code === "23505") {
    statusCode = 409;
    errorType = ErrorTypes.DUPLICATE_ENTRY;
    message = "El registro ya existe";
  } else if (error.code === "23503") {
    statusCode = 400;
    errorType = ErrorTypes.BAD_REQUEST;
    message = "No se puede completar la operación por dependencias activas";
  } else if (error.message?.includes("ECONNREFUSED")) {
    statusCode = 503;
    message = "Base de datos no disponible";
  }

  const friendlyName = ErrorFriendlyNames[errorType] || "Error Desconocido";

  console.error(`[ERROR] [${statusCode}] [${errorType}] ${error.message || message}`, details || "");

  return NextResponse.json(
    {
      success: false,
      error: {
        type: errorType,
        errorName: friendlyName,
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode },
  );
};

export const handleSuccess = (
  data,
  status = 200,
  message = null,
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
};

export const validateWithSchema = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedErrors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new AppError(
      "Error de validación",
      400,
      ErrorTypes.VALIDATION_ERROR,
      formattedErrors,
    );
  }
  return result.data;
};
