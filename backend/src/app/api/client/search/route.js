import { handleError, handleSuccess } from "../../../../lib/errorHandler";
import * as searchController from "../../../../features/search/controllers/searchController";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters = {
      q: searchParams.get("q") || undefined,
      category: searchParams.get("category") || undefined,
      minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")) : undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      sortBy: searchParams.get("sortBy") || "nombre",
      sortOrder: searchParams.get("sortOrder") || "asc"
    };

    const results = await searchController.searchProducts(filters);
    return handleSuccess(results, 200);
  } catch (error) {
    return handleError(error);
  }
}
