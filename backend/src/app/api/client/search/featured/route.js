import { handleError, handleSuccess } from "../../../../../lib/errorHandler";
import * as searchController from "../../../../../features/search/controllers/searchController";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10") || 10, 50);
    const featured = await searchController.getFeaturedProducts(limit);

    return handleSuccess(featured, 200);
  } catch (error) {
    return handleError(error);
  }
}
