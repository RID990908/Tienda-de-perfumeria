import { handleError, handleSuccess } from "../../../../lib/errorHandler";
import * as productController from "../../../../features/products/controllers/productController";

export async function GET() {
  try {
    const products = await productController.browseProducts();
    return handleSuccess(products, 200);
  } catch (error) {
    return handleError(error);
  }
}


