import { productService } from "../../../services/productService";
import { requireAdminSession } from "../../../lib/adminSession";
import { validateWithSchema } from "../../../lib/errorHandler";
import {
  createProductSchema,
  updateProductSchema,
} from "../../../lib/validationSchemas";

export const browseProducts = async () => {
  return await productService.getClientProducts();
};

export const viewProduct = async (req, { id }) => {
  return productService.getClientProductById(id);
};

export const listAllProductsAdmin = async (req) => {
  requireAdminSession(req);
  return productService.getAdminProducts();
};

export const createProductAdmin = async (req) => {
  requireAdminSession(req);
  const body = await req.json();
  const data = validateWithSchema(createProductSchema, body);
  return productService.createProduct(data);
};

export const updateProductAdmin = async (req, { id }) => {
  requireAdminSession(req);
  const body = await req.json();
  const data = validateWithSchema(updateProductSchema, body);
  return productService.updateProduct(id, data);
};

export const deleteProductAdmin = async (req, { id }) => {
  requireAdminSession(req);
  return productService.deleteProduct(id);
};

export const updateInventoryAdmin = async (req, { id }) => {
  requireAdminSession(req);
  const body = await req.json();
  const { stock } = body;
  return productService.updateInventoryStock(id, stock);
};
