import { z } from "zod";
import {
  handleError,
  handleSuccess,
  validateWithSchema,
} from "../../../../../lib/errorHandler";
import { requireAdminSession } from "../../../../../lib/adminSession";
import { productIdSchema } from "../../../../../lib/validationSchemas";
import * as userController from "../../../../../features/users/controllers/userController";

const roleSchema = z.object({
  role: z.enum(["client", "admin"]),
});

export async function PUT(req, { params }) {
  try {
    requireAdminSession(req);
    const { id } = validateWithSchema(productIdSchema, params);
    const body = await req.json();
    const validatedData = validateWithSchema(roleSchema, body);
    const updatedUser = await userController.updateUserRole(id, validatedData.role);

    return handleSuccess(updatedUser, 200, "Rol actualizado exitosamente");
  } catch (error) {
    return handleError(error);
  }
}
