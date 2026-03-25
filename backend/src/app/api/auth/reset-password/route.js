import { handleError, handleSuccess } from "../../../../lib/errorHandler";
import { enforceRateLimit } from "../../../../lib/memoryRateLimit";
import { getClientIp } from "../../../../lib/utils";
import * as authController from "../../../../features/auth/controllers/authController";

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    enforceRateLimit({
      key: `reset-password-${ip}`,
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: "Demasiados intentos. Intenta mÃ¡s tarde.",
    });

    await authController.resetPassword(req);

    return handleSuccess(null, 200, "ContraseÃ±a actualizada correctamente.");
  } catch (error) {
    return handleError(error);
  }
}


