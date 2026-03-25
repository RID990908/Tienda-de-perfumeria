import * as orderService from "../../../services/orderService";
import { validateWithSchema } from "../../../lib/errorHandler";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../../../lib/validationSchemas";

export const listOrders = async (filters) => {
  return await orderService.getAllOrders(filters);
};

export const createOrder = async (userId, req) => {
  const body = await req.json();
  const data = validateWithSchema(createOrderSchema, body);
  return await orderService.createNewOrder(
    userId,
    data.items,
    data.total,
    data.notas || null,
  );
};

export const getOrderById = async (orderId) => {
  return await orderService.getOrder(orderId);
};

export const updateStatus = async (orderId, req) => {
  const body = await req.json();
  const { estado } = validateWithSchema(updateOrderStatusSchema, body);
  return await orderService.updateStatus(orderId, estado);
};

export const cancelOrder = async (orderId) => {
  return await orderService.cancelOrderService(orderId);
};
