import { AppError } from '../utils/appError.js';
import logger from '../utils/logger.js';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || [],
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation failed',
      errors: err.issues,
    });
  }

  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    'Unexpected error'
  );

  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'Something went wrong! Please try again later.',
  });
};

export default errorHandler;
