import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";
const envJwtSecret = process.env.JWT_SECRET?.trim();
const DEV_FALLBACK_SECRET = "dev_only_insecure_secret_change_me";

if (!envJwtSecret && isProduction) {
  throw new Error(
    "JWT_SECRET no está configurado. Debe existir obligatoriamente en producción.",
  );
}

if (!envJwtSecret && !isProduction) {
  console.warn(
    "JWT_SECRET no configurado. Se usará un secreto temporal solo para desarrollo.",
  );
}

const JWT_SECRET = envJwtSecret || DEV_FALLBACK_SECRET;

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};
