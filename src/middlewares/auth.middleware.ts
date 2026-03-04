import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';
import type { AccessTokenPayload } from '../interface/auth.interfaces.js';
import { AsyncHandler } from '../utils/asyncHandler.js';
import { getAccessTokenFromRequest } from '../utils/getToken.js';
import { ENV } from '../configs/env.js';

export const authenticate = AsyncHandler(async (req, _res, next) => {
  const token = getAccessTokenFromRequest(req);

  if (!token) {
    throw new AppError(401, 'Authentication required');
  }

  let payload: AccessTokenPayload;

  try {
    payload = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }

  // Verify session still exists in DB (enables immediate revocation on logout)
  // const session = await prisma.session.findUnique({
  //   where: { id: payload.sid },
  // });

  // if (!session) {
  //   throw new AppError(401, 'Session has been revoked');
  // }

  req.user = {
    id: payload.sub,
    role: payload.role,
    sessionId: payload.sid,
  };

  next();
});
