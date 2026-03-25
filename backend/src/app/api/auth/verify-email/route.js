import { handleError, handleSuccess } from "../../../../lib/errorHandler";
import { enforceRateLimit } from "../../../../lib/memoryRateLimit";
import { getClientIp } from "../../../../lib/utils";
import * as authController from "../../../../features/auth/controllers/authController";

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    enforceRateLimit({
      key: `verify-email-${ip}`,
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: "Demasiados intentos. Intenta mÃ¡s tarde.",
    });

    await authController.verifyEmail(req);

    return handleSuccess(null, 200, "Correo verificado exitosamente.");
  } catch (error) {
    return handleError(error);
  }
}


