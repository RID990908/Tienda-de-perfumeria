import {
  handleError,
  handleSuccess,
  validateWithSchema,
} from "../../../lib/errorHandler";
import { requireAdminSession } from "../../../lib/adminSession";
import { addInventorySchema } from "../../../lib/validationSchemas";
import * as productController from "../../../features/products/controllers/productController";

export async function GET(req) {
  try {
    requireAdminSession(req);
    const inventory = await productController.listAllProductsAdmin(req);
    return handleSuccess(inventory, 200);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req) {
  try {
    requireAdminSession(req);
    const body = await req.json();
    const { id_producto, stock } = validateWithSchema(addInventorySchema, body);
    
    // We call the controller method. It expects (req, params) where params has id.
    const item = await productController.updateInventoryAdmin(
      { json: () => ({ stock }) }, 
      { id: id_producto }
    );

    return handleSuccess(item, 201, "Inventario actualizado exitosamente");
  } catch (error) {
    return handleError(error);
  }
}
