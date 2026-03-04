import type { Request } from 'express';

export const getAccessTokenFromRequest = (req: Request) => {
  if (req.cookies?.accessToken) return req.cookies.accessToken;

  const authHeader = req.header('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

export const getRefreshTokenFromRequest = (req: Request): string | null => {
  return req.cookies?.refreshToken ?? null;
};
