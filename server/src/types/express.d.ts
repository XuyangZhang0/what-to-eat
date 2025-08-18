import { JWTPayload } from '@/models/types.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      requestId?: string;
      timestamp?: string;
    }
  }
}

export {};