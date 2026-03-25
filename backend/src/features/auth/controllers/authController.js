import * as authService from "../../../services/authService";
import * as userService from "../../../services/userService";
import { generateToken } from "../../../lib/jwt";
import { validateWithSchema } from "../../../lib/errorHandler";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../../../lib/validationSchemas";

export const login = async (
  req,
) => {
  const body = await req.json();
  const { email, password } = validateWithSchema(loginSchema, body);
  const user = await userService.loginUser(email, password);

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

export const forgotPassword = async (req) => {
  const body = await req.json();
  const { email } = validateWithSchema(forgotPasswordSchema, body);
  return authService.forgotPassword(email);
};

export const resetPassword = async (req) => {
  const body = await req.json();
  const { email, token, newPassword } = validateWithSchema(
    resetPasswordSchema,
    body,
  );
  return authService.resetPassword(email, token, newPassword);
};

export const verifyEmail = async (req) => {
  const body = await req.json();
  const { email, token } = validateWithSchema(verifyEmailSchema, body);
  return authService.verifyEmail(email, token);
};


