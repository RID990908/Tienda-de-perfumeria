import {
  handleError,
  handleSuccess,
  validateWithSchema,
} from "../../../../lib/errorHandler";
import { requireAdminSession } from "../../../../lib/adminSession";
import { productIdSchema } from "../../../../lib/validationSchemas";
import * as orderController from "../../../../features/orders/controllers/orderController";

export async function GET(req, { params }) {
  try {
    requireAdminSession(req);
    const { id } = validateWithSchema(productIdSchema, params);
    const order = await orderController.getOrderById(id);
    return handleSuccess(order, 200);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req, { params }) {
  try {
    requireAdminSession(req);
    const { id } = validateWithSchema(productIdSchema, params);
    const updatedOrder = await orderController.updateStatus(id, req);
    return handleSuccess(updatedOrder, 200, "Estado de orden actualizado");
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req, { params }) {
  try {
    requireAdminSession(req);
    const { id } = validateWithSchema(productIdSchema, params);
    const cancelledOrder = await orderController.cancelOrder(id);
    return handleSuccess(cancelledOrder, 200, "Orden cancelada exitosamente");
  } catch (error) {
    return handleError(error);
  }
}
