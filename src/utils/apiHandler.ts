import { NextRequest, NextResponse } from 'next/server';
import { AuthError, DatabaseError } from '@/lib/auth';
import { ZodError } from 'zod';

export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }
      if (error instanceof AuthError) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: 401 }
        );
      }
      if (error instanceof DatabaseError) {
        return NextResponse.json(
          { success: false, error: 'Database error occurred' },
          { status: 500 }
        );
      }
      // Fallback for unknown errors
      console.error('API Handler Error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 