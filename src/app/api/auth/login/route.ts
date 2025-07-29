import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { z } from 'zod';
import { withErrorHandler } from '@/utils/apiHandler';

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { email, password } = loginSchema.parse(body);

  // Authenticate user
  const user = await authenticateUser(email, password);

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
    message: 'Login successful',
  });
}); 