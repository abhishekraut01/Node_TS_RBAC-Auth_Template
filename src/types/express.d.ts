import { AccessTokenPayload } from '../interfaces/auth.interfaces.ts';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: AccessTokenPayload['role'];
        sessionId: string;
      };
    }
  }
}

export {};
