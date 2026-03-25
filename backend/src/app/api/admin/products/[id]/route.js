import {
  handleError,
  handleSuccess,
  validateWithSchema,
} from "../../../../../lib/errorHandler";
import {
  productIdSchema,
} from "../../../../../lib/validationSchemas";
import * as productController from "../../../../../features/products/controllers/productController";
import { requireAdminSession } from "../../../../../lib/adminSession";

export async function GET(req, { params }) {
  try {
    requireAdminSession(req);
    const resolvedParams = await params;
    const { id } = validateWithSchema(productIdSchema, resolvedParams);
    const product = await productController.viewProduct(req, { id });
    return handleSuccess(product, 200);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req, { params }) {
  try {
    requireAdminSession(req);
    const resolvedParams = await params;
    const { id } = validateWithSchema(productIdSchema, resolvedParams);
    const updatedProduct = await productController.updateProductAdmin(req, { id });
    return handleSuccess(updatedProduct, 200, "Producto actualizado exitosamente");
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req, { params }) {
  try {
    requireAdminSession(req);
    const resolvedParams = await params;
    const { id } = validateWithSchema(productIdSchema, resolvedParams);
    const deletedProduct = await productController.deleteProductAdmin(req, { id });
    return handleSuccess(
      deletedProduct,
      200,
      "Producto eliminado correctamente",
    );
  } catch (error) {
    return handleError(error);
  }
}
