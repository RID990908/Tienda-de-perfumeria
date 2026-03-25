import {
  handleError,
  handleSuccess,
  validateWithSchema,
} from "../../../../../lib/errorHandler";
import { requireAdminSession } from "../../../../../lib/adminSession";
import {
  changePasswordSchema,
  productIdSchema,
} from "../../../../../lib/validationSchemas";
import * as userController from "../../../../../features/users/controllers/userController";

export async function POST(req, { params }) {
  try {
    const session = requireAdminSession(req);
    const { id } = validateWithSchema(productIdSchema, params);

    // Verificamos que el usuario solo cambie su propia contraseÃ±a
    if (session.id !== id) {
      return handleError(
        new Error("Solo puedes cambiar tu propia contrasena"),
        403,
      );
    }

    const body = await req.json();
    const validatedData = validateWithSchema(changePasswordSchema, body);
    const result = await userController.changeUserPassword(id, validatedData);

    return handleSuccess(result, 200, "Contrasena cambiada exitosamente");
  } catch (error) {
    return handleError(error);
  }
}
