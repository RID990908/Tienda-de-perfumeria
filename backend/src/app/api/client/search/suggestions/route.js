import { handleError, handleSuccess } from "../../../../../lib/errorHandler";
import * as searchController from "../../../../../features/search/controllers/searchController";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return handleSuccess([], 200);
    }

    const limit = Math.min(parseInt(searchParams.get("limit") || "5") || 5, 20);
    const suggestions = await searchController.getSuggestions(q, limit);

    return handleSuccess(suggestions, 200);
  } catch (error) {
    return handleError(error);
  }
}
