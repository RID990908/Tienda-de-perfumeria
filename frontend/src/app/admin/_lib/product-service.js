import { adminApi } from "./api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function listProducts() {
  const response = await adminApi("/api/admin/products");
  return response.data;
}

export async function createProduct(payload) {
  const response = await adminApi("/api/admin/products", {
    method: "POST",
    body: payload,
  });

  return response.data;
}

export async function updateProduct(id, payload) {
  const response = await adminApi(
    `/api/admin/products/${id}`,
    {
      method: "PATCH",
      body: payload,
    },
  );

  return response.data;
}

export async function deleteProduct(id) {
  const response = await adminApi(
    `/api/admin/products/${id}`,
    {
      method: "DELETE",
    },
  );

  return response.data;
}

export async function uploadProductImage(file) {
  const body = new FormData();
  body.append("image", file);

  const response = await adminApi(
    "/api/admin/uploads/product-image",
    {
      method: "POST",
      body,
    },
  );

  return response.data;
}

export function resolveProductImage(path) {
  if (!path) {
    return "/logo.svg";
  }

  if (path.startsWith("http") || path.startsWith("data:")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}
