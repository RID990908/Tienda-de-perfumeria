import * as cartService from "../../../services/cartService";
import { validateWithSchema } from "../../../lib/errorHandler";
import {
  addToCartSchema,
  removeFromCartSchema,
} from "../../../lib/validationSchemas";

export const browseCart = async () => {
  return await cartService.listCartItems();
};

export const addItem = async (req) => {
  const body = await req.json();
  const { id_producto, cantidad } = validateWithSchema(addToCartSchema, body);
  return await cartService.addItemToCart(id_producto, cantidad);
};

export const removeItem = async (req) => {
  const body = await req.json();
  const { id_carrito } = validateWithSchema(removeFromCartSchema, body);
  return await cartService.removeItemFromCart(id_carrito);
};

export const clearCart = async () => {
  return await cartService.clearEntireCart();
};

export const getCartSummary = async () => {
  return await cartService.getCartSummary();
};
