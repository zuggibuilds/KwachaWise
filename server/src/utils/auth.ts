import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }

  return secret;
}

export function signToken(user: AuthUser): string {
  const secret = getJwtSecret();

  return jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUser {
  const secret = getJwtSecret();

  const payload = jwt.verify(token, secret) as jwt.JwtPayload & { email?: string };
  return {
    id: String(payload.sub),
    email: String(payload.email ?? '')
  };
}
