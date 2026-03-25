import {
  handleError,
  handleSuccess,
} from "../../../../lib/errorHandler";
import * as productController from "../../../../features/products/controllers/productController";
import { requireAdminSession } from "../../../../lib/adminSession";

export async function GET(req) {
  try {
    requireAdminSession(req); 
    const products = await productController.listAllProductsAdmin(req);
    return handleSuccess(products, 200);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req) {
  try {
    requireAdminSession(req);
    const newProduct = await productController.createProductAdmin(req);
    return handleSuccess(newProduct, 201, "Producto creado exitosamente");
  } catch (error) {
    return handleError(error);
  }
}
