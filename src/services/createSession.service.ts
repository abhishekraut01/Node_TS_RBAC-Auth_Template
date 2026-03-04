import jwt, { type SignOptions } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import ms from 'ms';
import { prisma } from '../db/index.js';
import { ENV } from '../configs/env.js';
import { Role } from '../../generated/prisma/index.js';

export async function createSession(
  userId: string,
  role: Role,
  ip?: string,
  ua?: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const refreshTokenId = randomBytes(48).toString('hex');

  const refreshExpiresAt = new Date(
    Date.now() + ms(ENV.REFRESH_TOKEN_EXPIRY as ms.StringValue)
  );

  const newSession = await prisma.session.create({
    data: {
      userId,
      refreshToken: refreshTokenId,
      ip: ip ?? null,
      userAgent: ua ?? null,
      expiresAt: refreshExpiresAt,
    },
  });

  const refreshToken = jwt.sign(
    { sub: userId, tokenId: refreshTokenId, role },
    ENV.JWT_REFRESH_SECRET,
    {
      expiresIn: ENV.REFRESH_TOKEN_EXPIRY,
    } as SignOptions
  );

  const accessToken = jwt.sign(
    { sub: userId, role, sid: newSession.id },
    ENV.JWT_ACCESS_SECRET,
    {
      expiresIn: ENV.ACCESS_TOKEN_EXPIRY,
    } as SignOptions
  );

  return {
    accessToken,
    refreshToken,
  };
}
