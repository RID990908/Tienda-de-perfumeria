import { handleError, handleSuccess } from "../../../../../lib/errorHandler";
import { verifyToken } from "../../../../../lib/jwt";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return handleError(
        { message: "No autorizado" },
        401,
      );
    }

    const payload = verifyToken(token);

    if (!payload || payload.role !== "admin") {
      return handleError(
        { message: "Token inválido o permisos insuficientes" },
        401,
      );
    }

    return handleSuccess(
      {
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role,
        },
      },
      200,
      "Sesión admin válida",
    );
  } catch (error) {
    return handleError(error);
  }
}
