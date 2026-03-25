import { handleError, handleSuccess } from "../../../../../lib/errorHandler";
import * as productController from "../../../../../features/products/controllers/productController";

export async function GET(req, { params }) {
  try {
    const id = parseInt(params.id);
    const product = await productController.viewProduct(req, { id });
    return handleSuccess(product, 200);
  } catch (error) {
    return handleError(error);
  }
}
