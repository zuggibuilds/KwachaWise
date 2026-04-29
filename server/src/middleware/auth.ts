import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import { verifyToken } from '../utils/auth.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');
  const headerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
  // support token via query param (useful for EventSource that can't set headers)
  const queryToken = (req.query && (req.query as any).token) || undefined;
  const token = headerToken ?? queryToken;

  if (!token) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
  }
}
