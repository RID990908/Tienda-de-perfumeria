import * as orderModel from "../models/orderModel";
import { AppError, ErrorTypes } from "../lib/errorHandler";

export async function getAllOrders(filters = {}) {
  try {
    return await orderModel.getAllOrders(filters);
  } catch {
    throw new AppError(
      "Error al obtener ordenes",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function getOrder(id_orden) {
  try {
    const order = await orderModel.getOrderById(id_orden);

    if (!order) {
      throw new AppError("Orden no encontrada", 404, ErrorTypes.NOT_FOUND);
    }

    return order;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Error al obtener la orden",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function getUserOrders(id_usuario) {
  try {
    if (!id_usuario || typeof id_usuario !== "number") {
      throw new AppError(
        "ID de usuario invalido",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    return await orderModel.getOrdersByUser(id_usuario);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Error al obtener ordenes del usuario",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function createNewOrder(
  id_usuario,
  items,
  total,
  notas = null,
) {
  if (!id_usuario || typeof id_usuario !== "number") {
    throw new AppError(
      "ID de usuario invalido",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(
      "La orden debe contener al menos 1 item",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  if (items.length > 100) {
    throw new AppError(
      "Una orden no puede contener mas de 100 items",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  for (const item of items) {
    if (
      !item.id_producto ||
      !item.cantidad ||
      !item.precio ||
      typeof item.id_producto !== "number" ||
      typeof item.cantidad !== "number" ||
      typeof item.precio !== "number"
    ) {
      throw new AppError(
        "Items invalidos. Deben tener, cantidad, precio",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    if (item.cantidad < 1 || !Number.isInteger(item.cantidad)) {
      throw new AppError(
        "La cantidad debe ser un numero entero mayor a 0",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    if (item.precio <= 0) {
      throw new AppError(
        "El precio debe ser mayor a 0",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }
  }

  if (typeof total !== "number" || total <= 0) {
    throw new AppError(
      "El total debe ser un numero mayor a 0",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  try {
    return await orderModel.createOrder(id_usuario, items, total, notas);
  } catch (error) {
    if (error.message.includes("Stock insuficiente")) {
      throw new AppError(error.message, 400, ErrorTypes.INSUFFICIENT_STOCK);
    }

    if (error.message.includes("no encontrado")) {
      throw new AppError(error.message, 404, ErrorTypes.NOT_FOUND);
    }

    throw new AppError(
      error.message || "Error al crear la orden",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function updateStatus(id_orden, nuevoEstado) {
  try {
    if (!id_orden || typeof id_orden !== "number") {
      throw new AppError(
        "ID de orden invalido",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    const estadosValidos = [
      "pendiente",
      "procesando",
      "enviado",
      "entregado",
      "cancelado",
    ];

    if (!estadosValidos.includes(nuevoEstado)) {
      throw new AppError(
      `Estado invalido. Valores validos: ${estadosValidos.join(", ")}`,
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    return await orderModel.updateOrderStatus(id_orden, nuevoEstado);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.message.includes("no encontrada")) {
      throw new AppError("Orden no encontrada", 404, ErrorTypes.NOT_FOUND);
    }

    throw new AppError(error.message, 500, ErrorTypes.INTERNAL_ERROR);
  }
}

export async function cancelOrderService(id_orden) {
  try {
    if (!id_orden || typeof id_orden !== "number") {
      throw new AppError(
        "ID de orden invalido",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    return await orderModel.cancelOrder(id_orden);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.message.includes("no encontrada")) {
      throw new AppError("Orden no encontrada", 404, ErrorTypes.NOT_FOUND);
    }

    if (error.message.includes("No se puede cancelar")) {
      throw new AppError(error.message, 400, ErrorTypes.BAD_REQUEST);
    }

    throw new AppError(error.message, 500, ErrorTypes.INTERNAL_ERROR);
  }
}

export async function getOrderStats() {
  try {
    return await orderModel.getOrderStatistics();
  } catch {
    throw new AppError(
      "Error al obtener estadisticas",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}


