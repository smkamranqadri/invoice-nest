import jwt from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Custom error classes for better error handling
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, 12);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await compare(password, hashedPassword);
};

// JWT utilities
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token has expired', 'TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token', 'INVALID_TOKEN');
    } else {
      throw new AuthError('Token verification failed', 'TOKEN_VERIFICATION_FAILED');
    }
  }
};

// Authentication helpers
export const authenticateUser = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AuthError('User account is inactive', 'USER_INACTIVE');
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new AuthError('Invalid password', 'INVALID_PASSWORD');
    }

    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new DatabaseError('Database error during authentication');
  }
};

export const createUser = async (email: string, password: string, name: string, role: 'ADMIN' | 'USER' = 'USER') => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AuthError('User with this email already exists', 'USER_ALREADY_EXISTS');
    }

    const hashedPassword = await hashPassword(password);
    
    return await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new DatabaseError('Database error during user creation');
  }
};

export const checkSetupStatus = async (): Promise<boolean> => {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });
    return adminCount > 0;
  } catch (error) {
    throw new DatabaseError('Database error while checking setup status');
  }
};

export const getCurrentUser = async (token: string) => {
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AuthError('User account is inactive', 'USER_INACTIVE');
    }

    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new DatabaseError('Database error while fetching current user');
  }
}; 