import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  AuthError,
  JWTPayload,
} from '../auth';

import jwt from 'jsonwebtoken';

describe('auth utils', () => {
  const password = 'TestPassword123!';

  test('hashPassword and verifyPassword work together', async () => {
    const hashed = await hashPassword(password);
    expect(typeof hashed).toBe('string');
    expect(hashed).not.toBe(password);
    const isValid = await verifyPassword(password, hashed);
    expect(isValid).toBe(true);
    const isInvalid = await verifyPassword('wrong', hashed);
    expect(isInvalid).toBe(false);
  });

  test('generateToken and verifyToken work together', () => {
    const payload: JWTPayload = {
      userId: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
    };
    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  test('verifyToken throws AuthError for invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow(AuthError);
    try {
      verifyToken('invalid.token.here');
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError);
      expect(e.code).toBe('INVALID_TOKEN');
    }
  });

  test('verifyToken throws AuthError for expired token', () => {
    // Create an expired token
    const payload: JWTPayload = {
      userId: 'user-2',
      email: 'expired@example.com',
      role: 'USER',
    };
    const expiredToken = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key-here', { expiresIn: -1 });
    expect(() => verifyToken(expiredToken)).toThrow(AuthError);
    try {
      verifyToken(expiredToken);
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError);
      expect(e.code).toBe('TOKEN_EXPIRED');
    }
  });
}); 