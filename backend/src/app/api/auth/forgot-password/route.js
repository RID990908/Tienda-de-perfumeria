import { handleError, handleSuccess } from "../../../../lib/errorHandler";
import { enforceRateLimit } from "../../../../lib/memoryRateLimit";
import { getClientIp } from "../../../../lib/utils";
import * as authController from "../../../../features/auth/controllers/authController";

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    enforceRateLimit({
      key: `forgot-password-${ip}`,
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: "Demasiadas solicitudes. Intenta de nuevo mÃ¡s tarde.",
    });

    const result = await authController.forgotPassword(req);
    const message = result?.delivery?.delivered
      ? "Correo de recuperaciÃ³n enviado correctamente."
      : "Solicitud recibida. SMTP no configurado: en desarrollo, usa el cÃ³digo mostrado en consola.";

    return handleSuccess(result, 200, message);
  } catch (error) {
    return handleError(error);
  }
}


