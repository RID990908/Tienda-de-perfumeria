import {
  handleError,
  handleSuccess,
  validateWithSchema,
} from "../../../../lib/errorHandler";
import { requireAdminSession } from "../../../../lib/adminSession";
import {
  productIdSchema,
  updateProfileSchema,
} from "../../../../lib/validationSchemas";
import * as userController from "../../../../features/users/controllers/userController";

export async function GET(req, { params }) {
  try {
    requireAdminSession(req);
    const { id } = validateWithSchema(productIdSchema, params);
    const user = await userController.getUserProfile(id);

    return handleSuccess(user, 200);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req, { params }) {
  try {
    requireAdminSession(req);
    const { id } = validateWithSchema(productIdSchema, params);
    const body = await req.json();
    const validatedData = validateWithSchema(updateProfileSchema, body);
    const updatedUser = await userController.updateUserProfile(id, validatedData);

    return handleSuccess(updatedUser, 200, "Perfil actualizado exitosamente");
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req, { params }) {
  try {
    requireAdminSession(req);
    const { id } = validateWithSchema(productIdSchema, params);
    const deletedUser = await userController.deleteUser(id);

    return handleSuccess(deletedUser, 200, "Usuario eliminado exitosamente");
  } catch (error) {
    return handleError(error);
  }
}
