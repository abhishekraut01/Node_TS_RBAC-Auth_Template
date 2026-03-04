import { Role } from '../generated/prisma/client.js';
import { ENV } from '../configs/env.js';
import type { CookieOptions } from 'express';

export function getCookieOptions(type: 'access' | 'refresh'): CookieOptions {
  const isProduction = ENV.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction, // false in dev to work without HTTPS
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    maxAge:
      type === 'access'
        ? 15 * 60 * 1000 // 15 minutes
        : 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

interface BaseJWTPayload {
  sub: string; // userId
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AccessTokenPayload extends BaseJWTPayload {
  sid: string;
}

export interface RefreshTokenPayload extends BaseJWTPayload {
  tokenId: string;
}

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
}

export interface SignInInput {
  identifier: string;
  password: string;
}