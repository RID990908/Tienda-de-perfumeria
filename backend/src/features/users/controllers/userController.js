import * as userService from "../../../services/userService";
import { validateWithSchema } from "../../../lib/errorHandler";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../../../lib/validationSchemas";

export const listUsers = async (page, limit) => {
  return userService.getAllUsersService(page, limit);
};

export const registerUser = async (req) => {
  const data = await req.json();
  return userService.registerUser(data.email, data.password, data.name);
};

export const getUserProfile = async (userId) => {
  return userService.getUserProfile(userId);
};

export const updateUserProfile = async (userId, req) => {
  const body = await req.json();
  const data = validateWithSchema(updateProfileSchema, body);
  return userService.updateUserProfileService(userId, data);
};

export const changeUserPassword = async (userId, req) => {
  const body = await req.json();
  const { currentPassword, newPassword } = validateWithSchema(
    changePasswordSchema,
    body,
  );
  return userService.changePassword(userId, currentPassword, newPassword);
};

export const updateUserRole = async (userId, role = "client") => {
  return userService.updateUserRoleService(userId, role);
};

export const deleteUser = async (userId) => {
  return userService.deleteUserService(userId);
};
