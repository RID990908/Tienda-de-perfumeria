import { handleError, handleSuccess } from "../../../../../../lib/errorHandler";
import * as searchController from "../../../../../../features/search/controllers/searchController";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(parseInt(limitParam || "5") || 5, 20);
    const similar = await searchController.getSimilarProducts(parseInt(id), limit);

    return handleSuccess(similar, 200);
  } catch (error) {
    return handleError(error);
  }
}
