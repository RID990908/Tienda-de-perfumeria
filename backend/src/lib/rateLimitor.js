import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Demasiados intentos de login. Intenta de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error: "Demasiados registros. Intenta de nuevo más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: "Demasiadas solicitudes sensibles. Intenta de nuevo más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    error: "Demasiadas búsquedas. Intenta de nuevo más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const applyRateLimit = (limiter) => {
  return async (req, res) => {
    return new Promise((resolve) => {
      limiter(req, res, () => {
        resolve();
      });
    });
  };
};
