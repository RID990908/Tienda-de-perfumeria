import { AppError, ErrorTypes } from "./errorHandler";
import { verifyToken } from "./jwt";

export function getAdminSession(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    if (!payload) return null;
    
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function requireAdminSession(req) {
  const session = getAdminSession(req);

  if (!session) {
    throw new AppError(
      "Debes iniciar sesión como administrador",
      401,
      ErrorTypes.UNAUTHORIZED,
    );
  }

  if (session.role !== "admin") {
    throw new AppError(
      "No tienes permisos de administrador",
      403,
      ErrorTypes.FORBIDDEN,
    );
  }

  return session;
}
