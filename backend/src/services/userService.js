import bcrypt from "bcrypt";
import * as userModel from "../models/userModel";
import { AppError, ErrorTypes } from "../lib/errorHandler";
import { generateOTP } from "../lib/crypto";
import { sendOTPEmail } from "../lib/mailer";
import * as verificationModel from "../models/verificationModel";

export async function registerUser(email, password, name) {
  const existingUser = await userModel.emailExists(email);

  if (existingUser) {
    throw new AppError(
      "Este email ya esta registrado",
      409,
      ErrorTypes.DUPLICATE_ENTRY,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await userModel.createUser(email, hashedPassword, "client");

    void name;

    const { token, hash } = generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await verificationModel.createVerificationToken(
      newUser.id,
      hash,
      "REGISTRATION",
      expiresAt,
    );
    await sendOTPEmail(email, token, "REGISTRATION");

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      is_verified: newUser.is_verified,
      created_at: newUser.created_at,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Error registrando usuario",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function loginUser(email, password) {
  const user = await userModel.getUserByEmail(email);

  if (!user) {
    throw new AppError(
      "Email o contrasena invalidos",
      401,
      ErrorTypes.INVALID_CREDENTIALS,
    );
  }

  if (!user.is_verified) {
    throw new AppError(
      "Cuenta no verificada. Revisa tu correo e introduce tu codigo de verificacion.",
      403,
      ErrorTypes.FORBIDDEN,
    );
  }

  if (!user.password) {
    throw new AppError("Error en la cuenta", 500, ErrorTypes.INTERNAL_ERROR);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new AppError(
      "Email o contrasena invalidos",
      401,
      ErrorTypes.INVALID_CREDENTIALS,
    );
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    is_verified: user.is_verified,
  };
}

export async function getUserProfile(userId) {
  const user = await userModel.getUserById(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404, ErrorTypes.NOT_FOUND);
  }

  return user;
}

export async function getAllUsersService(page = 1, limit = 10) {
  if (typeof limit !== "number" || limit > 100) {
    throw new AppError(
      "Parametros de paginacion invalidos",
      400,
      ErrorTypes.VALIDATION_ERROR,
    );
  }

  const offset = (page - 1) * limit;

  try {
    return await userModel.getAllUsers(limit, offset);
  } catch {
    throw new AppError(
      "Error obteniendo usuarios",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function updateUserProfileService(userId, updates) {
  try {
    return await userModel.updateUserProfile(userId, updates);
  } catch (error) {
    if (error.message.includes("no encontrado")) {
      throw new AppError("Usuario no encontrado", 404, ErrorTypes.NOT_FOUND);
    }

    throw new AppError(error.message, 500, ErrorTypes.INTERNAL_ERROR);
  }
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await userModel.getUserById(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404, ErrorTypes.NOT_FOUND);
  }

  const userWithHash = await userModel.getUserByEmail(user.email);
  if (!userWithHash || !userWithHash.password) {
    throw new AppError("Error al obtener datos del usuario", 500, ErrorTypes.INTERNAL_ERROR);
  }

  const passwordMatch = await bcrypt.compare(
    currentPassword,
    userWithHash.password,
  );

  if (!passwordMatch) {
    throw new AppError(
      "Contrasena actual incorrecta",
      401,
      ErrorTypes.UNAUTHORIZED,
    );
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  try {
    return await userModel.updatePassword(userId, hashedNewPassword);
  } catch {
    throw new AppError(
      "Error cambiando contrasena",
      500,
      ErrorTypes.INTERNAL_ERROR,
    );
  }
}

export async function updateUserRoleService(userId, newRole) {
  try {
    return await userModel.updateUserRole(userId, newRole);
  } catch (error) {
    if (error.message.includes("no encontrado")) {
      throw new AppError("Usuario no encontrado", 404, ErrorTypes.NOT_FOUND);
    }

    throw new AppError(error.message, 500, ErrorTypes.INTERNAL_ERROR);
  }
}

export async function deleteUserService(userId) {
  try {
    return await userModel.deleteUser(userId);
  } catch (error) {
    if (error.message.includes("no encontrado")) {
      throw new AppError("Usuario no encontrado", 404, ErrorTypes.NOT_FOUND);
    }

    throw new AppError(error.message, 500, ErrorTypes.INTERNAL_ERROR);
  }
}


