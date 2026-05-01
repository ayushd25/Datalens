import rateLimit from 'express-rate-limit';

// No rate limiting in development
export const rateLimiter = (req, res, next) => next();

export const authLimiter = (req, res, next) => next();

export const aiLimiter = (req, res, next) => next();