import { rateLimit } from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Çok fazla deneme yaptın. Lütfen biraz sonra tekrar dene.",
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Fotoğraf analizi limitine ulaştın. Lütfen daha sonra tekrar dene.",
  },
});
