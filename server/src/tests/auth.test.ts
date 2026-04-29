import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { signToken, verifyToken } from '../utils/auth.js';
import { requireAuth } from '../middleware/auth.js';

function makeRequest(headers: Record<string, string> = {}, query: Record<string, unknown> = {}) {
  return {
    header(name: string) {
      return headers[name.toLowerCase()];
    },
    query
  } as any;
}

describe('auth utils', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-1234567890';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('signs and verifies a token', () => {
    const token = signToken({ id: 'user-1', email: 'demo@example.com' });
    const user = verifyToken(token);

    expect(user).toEqual({ id: 'user-1', email: 'demo@example.com' });
  });

  it('throws when secret is missing', () => {
    delete process.env.JWT_SECRET;

    expect(() => signToken({ id: 'user-1', email: 'demo@example.com' })).toThrow('JWT_SECRET is required');
  });
});

describe('requireAuth', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-1234567890';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('accepts bearer tokens and attaches user', () => {
    const token = signToken({ id: 'user-2', email: 'auth@example.com' });
    const req = makeRequest({ authorization: `Bearer ${token}` });
    const next = vi.fn();

    requireAuth(req, {} as any, next);

    expect(req.user).toEqual({ id: 'user-2', email: 'auth@example.com' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects missing tokens', () => {
    const req = makeRequest();
    const next = vi.fn();

    requireAuth(req, {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0][0] as Error).message).toContain('Authentication required');
  });
});
