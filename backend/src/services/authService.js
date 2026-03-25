import bcrypt from "bcrypt";
import * as userModel from "../models/userModel";
import * as verificationModel from "../models/verificationModel";
import { AppError, ErrorTypes } from "../lib/errorHandler";
import { generateOTP, hashToken } from "../lib/crypto";
import { sendOTPEmail } from "../lib/mailer";

export const forgotPassword = async (email) => {
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw new AppError(
      "No existe ninguna cuenta asociada a este correo electrónico.",
      404,
      ErrorTypes.NOT_FOUND,
    );
  }

  const { token, hash } = generateOTP();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
  
  await verificationModel.createVerificationToken(
    user.id,
    hash,
    "PASSWORD_RESET",
    expiresAt,
  );

  const delivery = await sendOTPEmail(user.email, token, "PASSWORD_RESET");
  return {
    email: user.email,
    delivery: delivery ?? { delivered: false, simulated: true },
  };
};

export const resetPassword = async (
  email,
  token,
  newPassword,
) => {
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw new AppError("Usuario no encontrado", 404, ErrorTypes.NOT_FOUND);
  }

  const hash = hashToken(token);
  const record = await verificationModel.findValidToken(
    user.id,
    hash,
    "PASSWORD_RESET",
  );

  if (!record) {
    throw new AppError(
      "Código inválido o expirado",
      400,
      ErrorTypes.BAD_REQUEST,
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(record.user_id, passwordHash);
  await verificationModel.markTokenUsed(record.id);
  await verificationModel.markUserTokensUsed(record.user_id, "PASSWORD_RESET");
};

export const verifyEmail = async (
  email,
  token,
) => {
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw new AppError("Usuario no encontrado", 404, ErrorTypes.NOT_FOUND);
  }

  const hash = hashToken(token);
  const record = await verificationModel.findValidToken(
    user.id,
    hash,
    "REGISTRATION",
  );

  if (!record) {
    throw new AppError(
      "Código de verificación inválido o expirado",
      400,
      ErrorTypes.BAD_REQUEST,
    );
  }

  await userModel.verifyUser(record.user_id);
  await verificationModel.markTokenUsed(record.id);
  await verificationModel.markUserTokensUsed(record.user_id, "REGISTRATION");
  
  return true;
};
