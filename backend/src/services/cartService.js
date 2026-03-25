import * as cartModel from "../models/cartModel";
import { AppError, ErrorTypes } from "../lib/errorHandler";

export async function listCartItems() {
  try {
    const [items, totals] = await Promise.all([
      cartModel.getCart(),
      cartModel.getCartTotal(),
    ]);

    return {
      items,
      summary: {
        ...totals,
        impuesto_estimado:
          Math.round((Number(totals?.impuesto_estimado || 0)) * 100) / 100,
        total_con_impuesto:
          Math.round(
            (Number(totals?.total_general || 0) +
              Number(totals?.impuesto_estimado || 0)) *
              100,
          ) / 100,
      },
    };
  } catch (error) {
    throw new AppError(
      "Error al obtener el carrito",
      500,
      ErrorTypes.INTERNAL_ERROR,
      error.message,
    );
  }
}

export async function getCartSummary() {
  try {
    return await cartModel.getCartSummary();
  } catch {
    throw new AppError(
      "Error al calcular el resumen del carrito",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function addItemToCart(id_producto, cantidad = 1) {
  if (!id_producto) {
    throw new AppError(
      "El ID del producto es requerido",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  if (typeof id_producto !== "number" || id_producto <= 0) {
    throw new AppError(
      "El ID del producto debe ser un numero positivo",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  if (typeof cantidad !== "number" || cantidad <= 0 || cantidad > 100) {
    throw new AppError(
      "No puedes anadir mas de 100 unidades del mismo producto",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  try {
    return await cartModel.addToCart(id_producto, cantidad);
  } catch (error) {
    if (error.message.includes("Stock insuficiente")) {
      throw new AppError(error.message, 400, ErrorTypes.INSUFFICIENT_STOCK);
    }

    if (error.message.includes("no existe")) {
      throw new AppError(error.message, 404, ErrorTypes.NOT_FOUND);
    }

    throw new AppError(error.message, 500, ErrorTypes.INTERNAL_ERROR);
  }
}

export async function removeItemFromCart(id_carrito) {
  if (!id_carrito) {
    throw new AppError(
      "El ID del carrito es requerido",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  if (typeof id_carrito !== "number" || id_carrito <= 0) {
    throw new AppError(
      "El ID del carrito debe ser un numero positivo",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  try {
    return await cartModel.removeFromCart(id_carrito);
  } catch (error) {
    if (error.message.includes("no encontrado")) {
      throw new AppError(error.message, 404, ErrorTypes.NOT_FOUND);
    }

    throw new AppError(
      "Error al eliminar del carrito",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function clearEntireCart() {
  try {
    return await cartModel.clearCart();
  } catch {
    throw new AppError(
      "Error al limpiar el carrito",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function updateItemQuantity(id_carrito, newQuantity) {
  if (!id_carrito || newQuantity === null) {
    throw new AppError(
      "ID del carrito y cantidad son requeridos",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  if (typeof newQuantity !== "number" || newQuantity < 1) {
    throw new AppError(
      "La cantidad debe ser un numero mayor a 0",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  try {
    return await cartModel.updateCartItemQuantity(id_carrito, newQuantity);
  } catch (error) {
    if (error.message.includes("no encontrado")) {
      throw new AppError(error.message, 404, ErrorTypes.NOT_FOUND);
    }

    if (error.message.includes("Stock insuficiente")) {
      throw new AppError(error.message, 400, ErrorTypes.INSUFFICIENT_STOCK);
    }

    throw new AppError(error.message, 500, ErrorTypes.INTERNAL_ERROR);
  }
}


