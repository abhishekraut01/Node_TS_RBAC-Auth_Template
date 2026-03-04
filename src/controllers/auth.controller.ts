import type { Request, Response } from 'express';
import { userSignInSchema, userSignUpSchema } from '../validation/auth.schema.js';
import { AppError } from '../utils/AppError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AsyncHandler } from '../utils/asyncHandler.js';
import { getCookieOptions } from '../interfaces/auth.interfaces.js';
import { getRefreshTokenFromRequest } from '../utils/getToken.js';
import * as authService from '../services/auth.service.js';

// Helper: extract client info from request
function getClientInfo(req: Request) {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return { ip, userAgent };
}

export const handleSignup = AsyncHandler(async (req: Request, res: Response) => {
  const { success, data, error } = userSignUpSchema.safeParse(req.body);
  if (!success) {
    throw new AppError(400, 'Invalid User Input Schema', error.issues);
  }

  const { ip, userAgent } = getClientInfo(req);
  const result = await authService.signUp(data, ip, userAgent);

  return res
    .status(200)
    .cookie('accessToken', result.tokens.accessToken, getCookieOptions('access'))
    .cookie('refreshToken', result.tokens.refreshToken, getCookieOptions('refresh'))
    .json(
      new ApiResponse(200, 'Signup successful', {
        user: result.user,
      })
    );
});

export const handleSignin = AsyncHandler(async (req: Request, res: Response) => {
  const { success, data, error } = userSignInSchema.safeParse(req.body);
  if (!success) {
    throw new AppError(400, 'Invalid Input Schema', error.issues);
  }

  const { ip, userAgent } = getClientInfo(req);
  const result = await authService.signIn(data, ip, userAgent);

  return res
    .status(200)
    .cookie('accessToken', result.tokens.accessToken, getCookieOptions('access'))
    .cookie('refreshToken', result.tokens.refreshToken, getCookieOptions('refresh'))
    .json(
      new ApiResponse(200, 'Signin successful', {
        user: result.user,
      })
    );
});

export const healthCheck = (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

export const handleLogout = AsyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.sessionId) {
    throw new AppError(401, 'Unauthorized');
  }

  await authService.logout(req.user.sessionId);

  return res
    .clearCookie('accessToken', getCookieOptions('access'))
    .clearCookie('refreshToken', getCookieOptions('refresh'))
    .status(200)
    .json(new ApiResponse(200, 'Logout successful'));
});

export const getCurrentUser = AsyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'Unauthorized');
  }

  const user = await authService.getCurrentUser(req.user.id);

  return res.status(200).json(new ApiResponse(200, 'User fetched successfully', user));
});

export const refreshAccessToken = AsyncHandler(async (req: Request, res: Response) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    throw new AppError(401, 'Refresh token not found');
  }

  const { ip, userAgent } = getClientInfo(req);
  const result = await authService.refreshToken(refreshToken, ip, userAgent);

  return res
    .status(200)
    .cookie('accessToken', result.tokens.accessToken, getCookieOptions('access'))
    .cookie('refreshToken', result.tokens.refreshToken, getCookieOptions('refresh'))
    .json(new ApiResponse(200, 'Access token refreshed successfully'));
});