import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { Role } from '../generated/prisma/client.js';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthenticated'));
    }

    if (!allowedRoles.length) return next();

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden'));
    }

    next();
  };
};