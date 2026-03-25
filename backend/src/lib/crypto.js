import crypto from "crypto";

export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hash };
};

export const generateOTP = (length = 6) => {
  let token = "";
  const characters = "0123456789";
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hash };
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
