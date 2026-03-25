import { env } from "@/config/env";

export class ApiError extends Error {
  status;
  data;

  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(
  path,
  options= {}
) {
  const url = path.startsWith("http") ? path : `${env.apiBaseUrl}${path}`;

  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorData = data?.error;
    const errorPrefix = errorData?.errorName ? `[${errorData.errorName}] ` : "";
    const message = (errorData && errorData.message)
      ? `${errorPrefix}${errorData.message}`
      : (data && typeof data === "object" && data !== null && "message" in data)
        ? String(data.message)
        : `Request failed with status ${response.status}`;
        
    throw new ApiError(message, response.status, data);
  }

  return data;
}
