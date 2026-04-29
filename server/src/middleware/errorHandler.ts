import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: { code: error.code, message: error.message, details: error.details } });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    return;
  }

  res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected server error' } });
}
