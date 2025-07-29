import { NextResponse } from 'next/server';
import { checkSetupStatus } from '@/lib/auth';
import { withErrorHandler } from '@/utils/apiHandler';

export const runtime = "nodejs";

export const GET = withErrorHandler(async () => {
  const isSetupComplete = await checkSetupStatus();
  return NextResponse.json({
    success: true,
    data: {
      isSetupComplete,
    },
  });
}); 