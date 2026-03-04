import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../db/index.js';
import { createSession } from './createSession.service.js';
import { AppError } from '../utils/AppError.js';
import { ENV } from '../configs/env.js';
import type {
  RefreshTokenPayload,
  SignUpInput,
  SignInInput,
} from '../interface/auth.interfaces.js';

export async function signUp(data: SignUpInput, ip: string, userAgent: string) {
  const { email, username, password } = data;

  // Hash first to eliminate timing oracle on user enumeration
  const hashedPassword = await bcrypt.hash(password, 12);

  const [emailExists, usernameExists] = await Promise.all([
    prisma.users.findUnique({ where: { email }, select: { id: true } }),
    prisma.users.findUnique({ where: { username }, select: { id: true } }),
  ]);

  if (emailExists || usernameExists) {
    throw new AppError(409, 'User already exists');
  }

  const newUser = await prisma.users.create({
    data: { username, email, password: hashedPassword },
  });

  const tokens = await createSession(newUser.id, newUser.role, ip, userAgent);

  return {
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    },
    tokens,
  };
}

export async function signIn(data: SignInInput, ip: string, userAgent: string) {
  const { identifier, password } = data;

  const user = await prisma.users.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });

  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  const tokens = await createSession(user.id, user.role, ip, userAgent);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    tokens,
  };
}

export async function logout(sessionId: string) {
  await prisma.session.deleteMany({
    where: { id: sessionId },
  });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}

export async function refreshToken(token: string, ip: string, userAgent: string) {
  const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET) as RefreshTokenPayload;

  const session = await prisma.session.findFirst({
    where: {
      userId: decoded.sub,
      refreshToken: decoded.tokenId,
      expiresAt: { gt: new Date() },
    },
    include: { user: { select: { id: true, role: true } } },
  });

  if (!session) {
    throw new AppError(401, 'Invalid session');
  }

  await prisma.session.delete({ where: { id: session.id } });

  // Use the current role from DB, not the stale one from the token
  const tokens = await createSession(session.user.id, session.user.role, ip, userAgent);

  return { tokens };
}