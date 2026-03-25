const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiRequestError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.data = data;
  }
}

function buildErrorMessage(response, data) {
  const errorData = data?.error;
  const status = response?.status ?? 0;

  if (status === 401) {
    const backendMsg = errorData?.message;
    return backendMsg || "Sesión expirada. Inicia sesión de nuevo.";
  }

  if (status === 400 && errorData?.details && Array.isArray(errorData.details)) {
    const lines = errorData.details.map(
      (d) => `• ${d.field}: ${d.message}`
    );
    return lines.join("\n");
  }

  const errorPrefix = errorData?.errorName ? `[${errorData.errorName}] ` : "";
  const message =
    errorData?.message
      ? `${errorPrefix}${errorData.message}`
      : data && typeof data === "object" && data.message
        ? String(data.message)
        : `Error del servidor (${status})`;

  return message;
}

export async function adminApi(path, options = {}) {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response;
  let data;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers,
      body: options.body == null
        ? undefined
        : isFormData
          ? options.body
          : typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body),
    });
  } catch (err) {
    const isNetworkError =
      err?.name === "TypeError" && err?.message?.toLowerCase().includes("fetch");
    const message = isNetworkError
      ? "Error de conexión. Comprueba que el backend esté en marcha y accesible."
      : err instanceof Error ? err.message : "Error de conexión.";

    throw new ApiRequestError(message, 0, null);
  }

  const contentType = response.headers.get("content-type") ?? "";
  data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const parsed = typeof data === "string" ? null : data;
    const message =
      response.status === 0
        ? "Error de configuración CORS o red. Verifica que el backend esté en ejecución."
        : buildErrorMessage(response, parsed);

    throw new ApiRequestError(message, response.status, parsed);
  }

  return data;
}
