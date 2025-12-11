import rateLimit from "express-rate-limit";

// Limit requests to 100 per 15 minutes per IP
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message:
      "لقد تجاوزت الحد المسموح به من الطلبات، يرجى المحاولة مرة أخرى لاحقًا.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
