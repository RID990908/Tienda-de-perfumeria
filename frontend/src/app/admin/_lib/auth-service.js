import { adminApi } from "./api";

export async function loginAdmin(email, password) {
  const response = await adminApi("/api/admin/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return response.data.user;
}

export async function logoutAdmin() {
  return adminApi("/api/admin/auth/logout", {
    method: "POST",
  });
}

export async function getAdminSession() {
  const response = await adminApi("/api/admin/auth/me", {
    method: "GET",
  });

  return response.data.user;
}

export async function forgotAdminPassword(email) {
  return adminApi("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetAdminPassword(email, token, newPassword) {
  return adminApi("/api/auth/reset-password", {
    method: "POST",
    body: { email, token, newPassword },
  });
}
