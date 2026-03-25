import { handleError, handleSuccess } from "../../../lib/errorHandler";
import { requireAdminSession } from "../../../lib/adminSession";
import * as userController from "../../../features/users/controllers/userController";

export async function GET(req) {
  try {
    requireAdminSession(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "10") || 10,
      100,
    );
    const users = await userController.listUsers(page, limit);
    return handleSuccess(users, 200);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req) {
  try {
    const newUser = await userController.registerUser(req);
    return handleSuccess(newUser, 201, "Usuario registrado exitosamente");
  } catch (error) {
    return handleError(error);
  }
}


