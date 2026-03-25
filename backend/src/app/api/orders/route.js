import { handleError, handleSuccess } from "../../../lib/errorHandler";
import { requireAdminSession } from "../../../lib/adminSession";
import * as orderController from "../../../features/orders/controllers/orderController";

export async function GET(req) {
  try {
    requireAdminSession(req);
    const { searchParams } = new URL(req.url);
    const filters = {};

    if (searchParams.get("id_usuario")) {
      filters.id_usuario = parseInt(searchParams.get("id_usuario"));
    }
    if (searchParams.get("estado")) {
      filters.estado = searchParams.get("estado");
    }

    const orders = await orderController.listOrders(filters);
    return handleSuccess(orders, 200);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req) {
  try {
    const session = requireAdminSession(req);
    const order = await orderController.createOrder(session.id, req);
    return handleSuccess(order, 201, "Orden creada exitosamente");
  } catch (error) {
    return handleError(error);
  }
}
