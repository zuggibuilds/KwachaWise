import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? 'kwachawise-dev-only-secret-change-me';
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
