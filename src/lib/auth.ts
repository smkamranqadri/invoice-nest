import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh after 1 day
    // cookieCache disabled to prevent stale session data
    // (activeOrganizationId, profile updates, role changes, etc.)
    // Can optimize with caching in v2 if needed
  },
  plugins: [
    organization({
      creatorRole: "owner",
      membershipLimit: 50,
      invitationExpiresIn: 48 * 60 * 60, // 48 hours
      async sendInvitationEmail(data) {
        // For v1: log invitation link, implement email in v2
        const inviteLink = `${process.env.BETTER_AUTH_URL}/accept-invitation/${data.id}`;
        console.log(`Invitation for ${data.email}: ${inviteLink}`);
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
