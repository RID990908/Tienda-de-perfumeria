import * as searchModel from "../models/searchModel";
import { AppError, ErrorTypes } from "../lib/errorHandler";

export async function searchProductsService(
  filters = {},
) {
  try {
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(filters.limit) || 10),
    );

    if (filters.minPrice !== undefined && filters.minPrice < 0) {
      throw new AppError(
        "El precio mínimo no puede ser negativo",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    if (filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice) {
      throw new AppError(
        "El precio mínimo no puede ser mayor al máximo",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    const validSortFields = ["nombre", "precio", "cantidad", "created_at"];
    const sortBy = validSortFields.includes(filters.sortBy)
      ? filters.sortBy
      : "nombre";
    const sortOrder = ["asc", "desc"].includes(filters.sortOrder)
      ? filters.sortOrder
      : "asc";

    return searchModel.searchProducts({
      q: filters.q || "",
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || Number.MAX_SAFE_INTEGER,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Error en la búsqueda de productos",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function getFeaturedProductsService(
  limit = 10,
) {
  try {
    if (limit < 1 || limit > 100) {
      throw new AppError(
        "Límite debe estar entre 1 y 100",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    return await searchModel.getFeaturedProducts(limit);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Error obteniendo productos destacados",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function getSearchSuggestionsService(
  q,
  limit = 5,
) {
  try {
    if (!q || q.length < 2) {
      return [];
    }

    if (limit < 1 || limit > 100) {
      throw new AppError(
        "Límite debe estar entre 1 y 100",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    return await searchModel.getSearchSuggestions(q, limit);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Error obteniendo sugerencias",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function getSimilarProductsService(
  productId,
  limit = 5,
) {
  try {
    if (!productId || productId < 1) {
      throw new AppError(
        "ID de producto inválido",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    if (limit > 100) {
      throw new AppError(
        "Límite debe estar entre 1 y 100",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    return searchModel.getSimilarProducts(productId, limit);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Error obteniendo productos similares",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}


