import * as searchService from "../../../services/searchService";
import { validateWithSchema } from "../../../lib/errorHandler";
import { searchProductsSchema } from "../../../lib/validationSchemas";

export const searchProducts = async (filters) => {
  const validatedFilters = validateWithSchema(searchProductsSchema, filters);
  return await searchService.searchProductsService(validatedFilters);
};

export const getFeaturedProducts = async (limit) => {
  return await searchService.getFeaturedProductsService(limit);
};

export const getSuggestions = async (q, limit) => {
  return await searchService.getSearchSuggestionsService(q, limit);
};

export const getSimilarProducts = async (productId, limit) => {
  return await searchService.getSimilarProductsService(productId, limit);
};
