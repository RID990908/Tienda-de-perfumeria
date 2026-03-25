import { AppError, ErrorTypes } from "./errorHandler";

const buckets = new Map();

const getBucket = (key, windowMs) => {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now > existing.resetAt) {
    const fresh = { count: 0, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return fresh;
  }

  return existing;
};

export const enforceRateLimit = ({ key, windowMs, max, message }) => {
  const bucket = getBucket(key, windowMs);
  bucket.count += 1;

  if (bucket.count > max) {
    throw new AppError(
      message || "Demasiadas solicitudes. Intenta de nuevo más tarde.",
      429,
      ErrorTypes.BAD_REQUEST,
    );
  }
};
