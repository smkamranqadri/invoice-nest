import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: process.env.NODE_ENV === 'production' ? 'postgresql' : 'sqlite',
  }),
  advanced: {
    cookiePrefix: 'invoicenest',
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        input: false,
      },
    },
  },
  callbacks: {
    async session({
      session,
      user,
    }: {
      session: { user?: { id?: string; role?: string } };
      user: { id: string; role: string };
    }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
  },
  // Ensure password is handled properly
  password: {
    minLength: 8,
    maxLength: 128,
  },
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
