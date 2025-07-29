import { NextRequest, NextResponse } from 'next/server';
import { createUser, checkSetupStatus, generateToken } from '@/lib/auth';
import { z } from 'zod';
import { withErrorHandler } from '@/utils/apiHandler';

export const runtime = "nodejs";

const setupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { name, email, password } = setupSchema.parse(body);

  // Check if setup is already completed
  const isSetupComplete = await checkSetupStatus();
  if (isSetupComplete) {
    return NextResponse.json(
      { success: false, error: 'Setup already completed' },
      { status: 400 }
    );
  }

  // Create admin user
  const user = await createUser(email, password, name, 'ADMIN');

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
    message: 'Admin account created successfully',
  });
}); 