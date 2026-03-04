import rateLimit from 'express-rate-limit';

// per-minute limiter
export const perMinuteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Try again in a minute.',
  },
  keyGenerator: (req) => {
    return req.body.email;
  },
});

// per-hour limiter
export const perHourLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Try again in an hour.',
  },
  keyGenerator: (req) => req.body.email,
});
