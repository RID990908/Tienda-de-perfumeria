import * as productModel from "../models/productModel";
import { AppError, ErrorTypes } from "../lib/errorHandler";

export const getClientProducts = async () => {
  try {
    return await productModel.getActiveProducts();
  } catch {
    throw new AppError("Error obteniendo productos", 500, ErrorTypes.INTERNAL_ERROR);
  }
};

export const getClientProductById = async (id) => {
  const product = await productModel.getProductById(id);
  if (!product || !product.activo) {
    throw new AppError("Producto no encontrado", 404, ErrorTypes.NOT_FOUND);
  }
  return product;
};

export const getAdminProducts = async () => {
  return await productModel.getAllProducts();
};

export const createProduct = async (data) => {
  return await productModel.createProduct(data);
};

export const updateProduct = async (id, data) => {
  const updated = await productModel.updateProduct(id, data);
  if (!updated) {
    throw new AppError("Producto no encontrado", 404, ErrorTypes.NOT_FOUND);
  }
  return updated;
};

export const deleteProduct = async (id) => {
  const deleted = await productModel.deleteProduct(id);
  if (!deleted) {
    throw new AppError("Producto no encontrado", 404, ErrorTypes.NOT_FOUND);
  }
  return deleted;
};

export const updateInventoryStock = async (id, newStock) => {
  const updated = await productModel.updateStock(id, newStock);
  if (!updated) {
    throw new AppError("Producto no encontrado", 404, ErrorTypes.NOT_FOUND);
  }
  return updated;
};

// Also exporting as an object for controllers that might expect it
export const productService = {
  getClientProducts,
  getClientProductById,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventoryStock,
};


