import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const responseTimeMs = Number(endTime - startTime) / 1_000_000;

    const logPayload = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTimeMs.toFixed(2)}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    // Server errors
    if (res.statusCode >= 500) {
      logger.error(logPayload, 'Request failed');
    }
    // Client errors
    else if (res.statusCode >= 400) {
      logger.warn(logPayload, 'Client error');
    }
    // Success (logged only if debug enabled)
    else {
      logger.debug(logPayload, 'Request success');
    }
  });

  next();
};
