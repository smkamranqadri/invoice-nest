# Phase 1: Auth, Workspaces & UI Foundation - Research

**Researched:** 2026-02-13
**Domain:** Authentication, multi-tenant workspaces, UI component system
**Confidence:** HIGH (all critical libraries verified against current official docs and npm registry)

## Summary

Phase 1 establishes the entire application foundation: Next.js project scaffolding, PostgreSQL database with Drizzle ORM, session-based authentication via better-auth, multi-tenant workspace management via better-auth's organization plugin, and a UI component system using shadcn/ui (Radix + Tailwind CSS v4).

The critical discovery in this research is that **Next.js 16 is now the current stable release** (16.1.6 as of 2026-02-13), while the project research specified Next.js 15. Next.js 16 has significant breaking changes: middleware is renamed to "proxy", async request APIs are mandatory, and Turbopack is the default bundler. better-auth has confirmed Next.js 16 compatibility (issue #5263 closed as resolved). **Recommendation: Use Next.js 15.5.x** for this project to avoid the middleware-to-proxy migration complexity and because the broader ecosystem (tutorials, examples, better-auth docs) still primarily documents Next.js 15 patterns. Next.js 15.5.12 is the latest 15.x release and receives backported security patches.

The better-auth organization plugin is a near-perfect match for the workspace requirements. It provides built-in support for creating organizations, inviting members by email, assigning roles (owner/admin/member), removing members, and storing the active organization on the session. This eliminates the need to build custom workspace RBAC infrastructure.

**Primary recommendation:** Use Next.js 15.5.x + better-auth 1.4.x with the organization plugin + Drizzle ORM 0.45.x + shadcn/ui with Tailwind CSS v4. Let better-auth own all auth/organization database tables; add custom application tables (customers, invoices, etc.) alongside them in the same database.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^15.5.12 | Full-stack React framework (App Router) | Stable LTS-style release, ecosystem compatibility, middleware pattern well-documented |
| React | ^19.2.4 | UI library | Ships with Next.js 15.5.x, stable release |
| TypeScript | ^5.7 | Type safety | Non-negotiable for financial app, Drizzle end-to-end type safety |
| PostgreSQL | 16+ | Primary database | Relational data, ACID, Docker-ready, better-auth stores sessions here |
| Drizzle ORM | ^0.45.1 | Database ORM / query builder | Type-safe SQL, no binary deps (smaller Docker image), schema-as-code |
| drizzle-kit | ^0.31.9 | Migration tooling | Generates SQL migrations from schema diffs |
| postgres (postgres.js) | ^3.4.8 | PostgreSQL driver | Fastest Node.js PG driver, native ESM, built-in pooling |
| better-auth | ^1.4.18 | Authentication + organizations | Session-based auth, organizations plugin for workspaces, Drizzle adapter |

### UI

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | ^4.1.18 | Utility-first CSS | v4 stable, CSS-first config, faster builds, shadcn/ui fully compatible |
| shadcn/ui | N/A (copy-paste) | Pre-built Radix + Tailwind components | Not a dependency; source lives in project. Full Tailwind v4 + React 19 support confirmed |
| Radix UI | latest (unified package) | Accessible UI primitives | shadcn/ui is built on Radix. January 2026: unified Radix UI package released |
| Lucide React | ^0.564.0 | Icons | Default shadcn/ui icon set, tree-shakeable |
| tw-animate-css | ^1.4.0 | CSS animations | Replaces deprecated tailwindcss-animate for Tailwind v4 |
| clsx | ^2.1.1 | Conditional class names | Standard pattern with shadcn/ui `cn()` utility |
| tailwind-merge | ^3.4.0 | Tailwind class deduplication | Paired with clsx in `cn()` helper |

### Forms and Validation

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | ^4.3.6 | Schema validation | Client + server validation, integrates with Drizzle and React Hook Form |
| React Hook Form | ^7.71.1 | Form state management | Minimal re-renders, `useFieldArray` for dynamic fields |
| @hookform/resolvers | latest | Zod-to-RHF bridge | Connects Zod schemas to React Hook Form |

### Utilities

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @paralleldrive/cuid2 | ^3.3.0 | ID generation | Collision-resistant, URL-safe, non-sequential |
| @t3-oss/env-nextjs | ^0.13.10 | Env variable validation | Zod-validated env vars, catches missing config at build time |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js 15.5.x | Next.js 16.1.x | 16 renames middleware to proxy, forces async APIs, Turbopack default. Ecosystem still catching up. Upgrade later when ecosystem stabilizes. |
| better-auth organizations | Custom RBAC | Months of work to replicate invitation workflow, role management, session-organization binding |
| Tailwind v4 | Tailwind v3.4 | v3 is fallback if v4 issues arise. shadcn/ui confirmed v4 compatible. Use v4. |
| postgres.js | node-postgres (pg) | pg has wider community but postgres.js is faster and ESM-native. Both work with Drizzle. |

**Installation:**
```bash
# Create Next.js project
npx create-next-app@15 invoice-nest --typescript --tailwind --eslint --app --src-dir

# Database
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Authentication
npm install better-auth

# UI components (after shadcn init)
npx shadcn@latest init
npx shadcn@latest add button card dialog dropdown-menu form input label select separator sheet sidebar table tabs toast badge avatar

# Forms and validation
npm install zod react-hook-form @hookform/resolvers

# Utilities
npm install @paralleldrive/cuid2 @t3-oss/env-nextjs clsx tailwind-merge lucide-react
```

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    (auth)/                  # Public auth layout group
      sign-in/page.tsx       # Login page
      sign-up/page.tsx       # Signup page
    (dashboard)/             # Authenticated layout group
      layout.tsx             # Dashboard shell (sidebar, header)
      page.tsx               # Redirect to workspace dashboard
      [workspaceSlug]/       # Workspace-scoped routes
        dashboard/page.tsx   # Workspace dashboard
        settings/page.tsx    # Workspace settings (owner only)
        members/page.tsx     # Member management (owner only)
    api/
      auth/[...all]/route.ts # better-auth API handler
  components/
    ui/                      # shadcn/ui components (auto-generated)
    layout/                  # Shell, sidebar, header, nav components
    auth/                    # Auth-specific components (forms, guards)
  lib/
    auth.ts                  # better-auth server instance
    auth-client.ts           # better-auth client instance
    db/
      index.ts               # Drizzle DB connection
      schema/
        auth.ts              # better-auth generated schema
        index.ts             # Schema barrel export
      migrations/            # Generated SQL migrations
    validators/              # Zod schemas for forms/actions
    utils.ts                 # cn() helper, shared utilities
  hooks/                     # Custom React hooks
  types/                     # Shared TypeScript types
middleware.ts                # Session cookie check for route protection
drizzle.config.ts            # Drizzle Kit configuration
```

### Pattern 1: better-auth Server Instance with Organization Plugin

**What:** Central auth configuration that handles both authentication and organization/workspace management.
**When to use:** Single auth.ts file imported by API route handler and server components.

```typescript
// src/lib/auth.ts
// Source: https://www.better-auth.com/docs/plugins/organization
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
    expiresIn: 60 * 60 * 24 * 7,   // 7 days
    updateAge: 60 * 60 * 24,        // Refresh after 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,               // 5-minute cache to reduce DB hits
    },
  },
  plugins: [
    organization({
      // Only owners can invite (maps to AUTH-05, AUTH-06)
      creatorRole: "owner",
      membershipLimit: 50,
      invitationExpiresIn: 48 * 60 * 60, // 48 hours
      async sendInvitationEmail(data) {
        // For v1: log invitation link, implement email in v2
        const inviteLink = `${process.env.BETTER_AUTH_URL}/accept-invitation/${data.id}`;
        console.log(`Invitation for ${data.email}: ${inviteLink}`);
      },
    }),
    nextCookies(), // Required for server actions that set cookies
  ],
});

export type Session = typeof auth.$Infer.Session;
```

### Pattern 2: better-auth Client Instance

**What:** Client-side auth hooks and methods for React components.
**When to use:** All client components that need auth state or organization management.

```typescript
// src/lib/auth-client.ts
// Source: https://www.better-auth.com/docs/integrations/next
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});

// Export commonly used hooks and methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  organization,
} = authClient;
```

### Pattern 3: Next.js 15 Middleware for Route Protection

**What:** Lightweight cookie-existence check in middleware for fast redirects; full session validation in server components.
**When to use:** Every request to protected routes.

```typescript
// middleware.ts (root of project)
// Source: https://www.better-auth.com/docs/integrations/next
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  // Optimistic check: only verify cookie exists (no DB call)
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(dashboard)(.*)", "/api/(?!auth)(.*)"],
};
```

### Pattern 4: Server Component Session + Organization Validation

**What:** Full session and active organization validation in server components for data access.
**When to use:** Every server component/action that accesses workspace-scoped data.

```typescript
// Source: https://www.better-auth.com/docs/integrations/next
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getRequiredSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}

export async function getRequiredOrganization() {
  const session = await getRequiredSession();
  // Active organization is stored on the session by better-auth
  if (!session.session.activeOrganizationId) {
    redirect("/create-workspace");
  }
  return {
    session,
    organizationId: session.session.activeOrganizationId,
  };
}
```

### Pattern 5: Drizzle Database Connection

**What:** Singleton database connection using postgres.js driver with Drizzle ORM.
**When to use:** Single db/index.ts file imported everywhere.

```typescript
// src/lib/db/index.ts
// Source: https://orm.drizzle.team/docs/get-started-postgresql
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const queryClient = postgres(process.env.DATABASE_URL!);

export const db = drizzle(queryClient, { schema });
```

```typescript
// drizzle.config.ts
// Source: https://orm.drizzle.team/docs/migrations
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Pattern 6: Workspace-Scoped Data Access Layer

**What:** All application data queries require workspaceId, enforced at the data access layer.
**When to use:** Every query for customers, invoices, payments -- anything workspace-scoped.

```typescript
// Pattern for future phases -- establish the convention now
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { customers } from "@/lib/db/schema";

// ALWAYS include workspaceId in queries -- defense in depth
export async function getCustomersByWorkspace(workspaceId: string) {
  return db.query.customers.findMany({
    where: eq(customers.workspaceId, workspaceId),
  });
}

// ALWAYS verify workspace ownership when accessing by ID
export async function getCustomerById(workspaceId: string, customerId: string) {
  return db.query.customers.findFirst({
    where: and(
      eq(customers.id, customerId),
      eq(customers.workspaceId, workspaceId),
    ),
  });
}
```

### Anti-Patterns to Avoid

- **Querying without workspaceId:** Every data query (except auth tables) MUST include workspace scoping. Never query by entity ID alone.
- **Using Next.js 15 middleware for full session validation:** Middleware should only check cookie existence. Full validation (DB lookup) happens in server components. This keeps middleware fast.
- **Mixing better-auth tables with custom schema changes:** Let better-auth own its tables (user, session, account, verification, organization, member, invitation). Generate them with `@better-auth/cli generate`, then manage with drizzle-kit migrations. Do not manually modify better-auth table schemas.
- **Calling better-auth client methods from server components:** Use `auth.api.*` methods with `headers()` on the server. Use `authClient.*` methods on the client.
- **Building custom auth flows:** Do not implement signup, login, logout, session refresh, invitation workflow manually. better-auth handles all of this.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| User authentication | Custom session management, password hashing, CSRF protection | better-auth emailAndPassword | Security-critical; timing attacks, session fixation, CSRF are handled correctly by better-auth |
| Workspace/organization management | Custom RBAC tables, invitation system, role assignment | better-auth organization plugin | Complete invitation workflow with email, role management, active organization switching, member CRUD |
| UI component library | Custom buttons, dialogs, forms, tables from scratch | shadcn/ui (Radix + Tailwind) | Accessible, professional-looking, customizable. Months of work to replicate |
| Form validation | Custom validation functions | Zod + React Hook Form + @hookform/resolvers | Battle-tested, type-safe, handles edge cases (async validation, field arrays, error messages) |
| CSS utility system | Custom CSS framework or CSS-in-JS | Tailwind CSS v4 | Industry standard, tree-shakeable, consistent design tokens |
| Route protection | Custom auth middleware from scratch | better-auth getSessionCookie + auth.api.getSession | Correct cookie handling, session expiration, refresh logic built-in |
| ID generation | Auto-increment IDs or raw UUID | @paralleldrive/cuid2 | No information leakage, collision-resistant, URL-safe, good DB index performance |
| Environment validation | Runtime env checks scattered through code | @t3-oss/env-nextjs | Catches missing DATABASE_URL at build time, type-safe env access |

**Key insight:** better-auth's organization plugin provides approximately 80% of Phase 1's workspace functionality out of the box. The invitation workflow, role management, member CRUD, and active organization tracking are all built-in. Custom code is only needed for the UI and for connecting workspace IDs to application data (customers, invoices, etc.) in later phases.

## Common Pitfalls

### Pitfall 1: Forgetting to Pass Headers in Server Components

**What goes wrong:** `auth.api.getSession()` returns null even when user is logged in because headers were not forwarded.
**Why it happens:** Server components do not automatically include request headers. You must explicitly pass them.
**How to avoid:** Always use `headers: await headers()` when calling better-auth server APIs.
**Warning signs:** Session is always null in server components but works on the client.

### Pitfall 2: Not Running better-auth Schema Generation Before Drizzle Migrations

**What goes wrong:** Drizzle migration generates empty or incomplete migrations because the better-auth schema tables are missing from the Drizzle schema definition.
**Why it happens:** better-auth tables (user, session, account, verification, organization, member, invitation) need to be generated first with `@better-auth/cli generate`, then included in the Drizzle schema before running `drizzle-kit generate`.
**How to avoid:** Follow this order: (1) Configure better-auth with all plugins, (2) Run `npx @better-auth/cli@latest generate --output src/lib/db/schema/auth.ts`, (3) Export from schema barrel file, (4) Run `drizzle-kit generate`, (5) Run `drizzle-kit migrate`.
**Warning signs:** Missing tables in database, better-auth API returning 500 errors about missing columns.

### Pitfall 3: Cross-Workspace Data Leakage

**What goes wrong:** A user in Workspace A sees or modifies data from Workspace B.
**Why it happens:** A query fetches by entity ID without also checking workspaceId.
**How to avoid:** Every data access function takes workspaceId as a required first parameter. Add multi-workspace integration tests from day one.
**Warning signs:** API endpoints that accept entity IDs without workspace context. Database queries without workspaceId in WHERE clause.

### Pitfall 4: Tailwind v4 CSS Configuration Confusion

**What goes wrong:** Styles don't apply, theme variables don't work, animations break.
**Why it happens:** Tailwind v4 uses CSS-first configuration (`@theme` directive in CSS) instead of `tailwind.config.js`. Developers copy v3 patterns that don't work in v4.
**How to avoid:** Use `npx shadcn@latest init` which sets up the correct v4 configuration. Do not create a `tailwind.config.js`. Use `@theme inline` in CSS for custom theme variables. Replace `tailwindcss-animate` with `tw-animate-css`.
**Warning signs:** `tailwind.config.js` file exists in a v4 project. Using `@plugin 'tailwindcss-animate'` instead of `@import "tw-animate-css"`.

### Pitfall 5: better-auth Organization Default Role Permissions

**What goes wrong:** Members can do more or less than expected because default permissions don't match application requirements.
**Why it happens:** better-auth's default "member" role has read-only access and cannot create/update/delete resources. The default "owner" role has full access. The "admin" role (which we don't need) has intermediate access.
**How to avoid:** Define a custom permission matrix using better-auth's access control system. For InvoiceNest: owner gets full access (workspace settings, member management, all CRUD); member gets data CRUD (customers, invoices, payments) but NOT workspace settings or member management.
**Warning signs:** Members unable to create invoices, or members able to access workspace settings.

### Pitfall 6: Session Cookie Not Persisting Across Refresh

**What goes wrong:** Users are logged out after browser refresh (AUTH-03 failure).
**Why it happens:** The `nextCookies()` plugin is not included in the auth configuration, so server actions that set cookies don't properly set the response cookies in Next.js.
**How to avoid:** Always include `nextCookies()` in the better-auth plugins array. Verify cookie flags: HttpOnly, SameSite=Lax, appropriate Secure setting.
**Warning signs:** Login works but user is immediately logged out on page refresh.

## Code Examples

Verified patterns from official sources:

### better-auth API Route Handler

```typescript
// src/app/api/auth/[...all]/route.ts
// Source: https://www.better-auth.com/docs/integrations/next
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Sign Up Flow (Client)

```typescript
// Source: https://www.better-auth.com/docs/installation
import { authClient } from "@/lib/auth-client";

async function handleSignUp(name: string, email: string, password: string) {
  const { data, error } = await authClient.signUp.email({
    name,
    email,
    password,
  });
  if (error) {
    // Handle error
    return;
  }
  // User is now signed up and signed in
  // data.user and data.session are available
}
```

### Create Workspace (Client)

```typescript
// Source: https://www.better-auth.com/docs/plugins/organization
import { authClient } from "@/lib/auth-client";

async function handleCreateWorkspace(name: string, slug: string) {
  const { data, error } = await authClient.organization.create({
    name,
    slug,
    metadata: {}, // Can store company details here
  });
  if (error) {
    return;
  }
  // Organization is created and set as active
  // User is automatically the "owner"
}
```

### Invite Member (Client)

```typescript
// Source: https://www.better-auth.com/docs/plugins/organization
import { authClient } from "@/lib/auth-client";

async function handleInviteMember(email: string, role: "owner" | "member") {
  const { data, error } = await authClient.organization.inviteMember({
    email,
    role,
    // organizationId defaults to active organization
  });
  if (error) {
    // Handle error (e.g., user already invited, no permission)
    return;
  }
  // Invitation sent -- sendInvitationEmail callback is triggered on server
}
```

### Remove Member (Client)

```typescript
// Source: https://www.better-auth.com/docs/plugins/organization
import { authClient } from "@/lib/auth-client";

async function handleRemoveMember(memberIdOrEmail: string) {
  const { data, error } = await authClient.organization.removeMember({
    memberIdOrEmail,
    // organizationId defaults to active organization
  });
  if (error) {
    return;
  }
}
```

### Update Member Role (Client)

```typescript
// Source: https://www.better-auth.com/docs/plugins/organization
import { authClient } from "@/lib/auth-client";

async function handleUpdateRole(memberId: string, role: "owner" | "member") {
  const { data, error } = await authClient.organization.updateMemberRole({
    memberId,
    role,
  });
  if (error) {
    return;
  }
}
```

### Get Session with Active Organization (Server Component)

```typescript
// Source: https://www.better-auth.com/docs/integrations/next
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkspacePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Active organization ID is on the session
  const orgId = session.session.activeOrganizationId;

  if (!orgId) {
    redirect("/create-workspace");
  }

  // Get full organization details including members
  const org = await auth.api.getFullOrganization({
    query: { organizationId: orgId },
    headers: await headers(),
  });

  return (
    <div>
      <h1>{org?.name}</h1>
      <p>Members: {org?.members?.length}</p>
    </div>
  );
}
```

### Check Permission (Server)

```typescript
// Source: https://www.better-auth.com/docs/plugins/organization
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function requireOwnerRole() {
  const member = await auth.api.getActiveMember({
    headers: await headers(),
  });

  if (!member || member.role !== "owner") {
    throw new Error("Forbidden: owner role required");
  }

  return member;
}
```

### shadcn/ui Form with Zod Validation

```typescript
// Source: shadcn/ui form component pattern
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const workspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "URL-safe characters only"),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

export function CreateWorkspaceForm() {
  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "", slug: "" },
  });

  async function onSubmit(values: WorkspaceFormValues) {
    // Call authClient.organization.create(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace Name</FormLabel>
              <FormControl>
                <Input placeholder="My Company" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Workspace</Button>
      </form>
    </Form>
  );
}
```

### Environment Variable Validation

```typescript
// src/lib/env.ts
// Source: @t3-oss/env-nextjs docs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  // experimental__runtimeEnv: only list client-side vars
  // Server vars are auto-destructured from process.env
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

## better-auth Organization Plugin: Database Schema

The organization plugin creates these tables automatically (generated via CLI):

### Tables Created by better-auth

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `user` | id, name, email, emailVerified, image, createdAt, updatedAt | User accounts |
| `session` | id, userId, token, expiresAt, ipAddress, userAgent, activeOrganizationId | Active sessions with org context |
| `account` | id, userId, accountId, providerId, password | Auth provider credentials |
| `verification` | id, identifier, value, expiresAt | Email verification tokens |
| `organization` | id, name, slug, logo, metadata, createdAt | Workspaces/organizations |
| `member` | id, userId, organizationId, role, createdAt | Organization membership + role |
| `invitation` | id, email, inviterId, organizationId, role, status, expiresAt | Pending invitations |

### Key Relationship: Session -> Active Organization

The `session` table has an `activeOrganizationId` field. When a user calls `authClient.organization.setActive()`, this field is updated. All subsequent `auth.api.getSession()` calls return the active organization ID, enabling workspace-scoped queries without extra lookups.

### Custom Application Tables (for later phases)

Application tables (customers, invoices, etc.) will reference the `organization` table's `id` field as their `workspaceId` foreign key. This is the multi-tenant isolation mechanism.

```typescript
// Example schema for later phases (establishes the pattern)
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const customers = pgTable("customer", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  workspaceId: text("workspace_id").notNull(), // FK to organization.id
  name: text("name").notNull(),
  email: text("email"),
  // ... other fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

## shadcn/ui Components for Phase 1

### Required Components

| Component | Usage in Phase 1 |
|-----------|-----------------|
| `button` | All interactive actions (sign in, sign up, create workspace, invite member) |
| `card` | Auth forms, workspace creation form, member cards |
| `dialog` | Invite member dialog, confirm removal dialog |
| `dropdown-menu` | User menu (profile, sign out), workspace switcher |
| `form` | All form patterns (sign in, sign up, workspace creation, invite) |
| `input` | Email, password, workspace name, slug fields |
| `label` | Form field labels |
| `select` | Role selection (owner/member) |
| `separator` | Visual dividers in sidebar and forms |
| `sheet` | Mobile sidebar drawer |
| `sidebar` | Main navigation sidebar (shadcn/ui sidebar component) |
| `table` | Members list table |
| `tabs` | Settings page sections |
| `toast` | Success/error notifications |
| `badge` | Role badges (owner/member), invitation status |
| `avatar` | User avatars in sidebar and member list |

### shadcn/ui Sidebar Component

shadcn/ui provides a dedicated sidebar component that is composable, themeable, and responsive. It includes:
- `SidebarProvider` wrapper
- `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter` layout components
- `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` for navigation items
- Built-in mobile responsiveness (collapses to sheet on mobile)
- Workspace switcher pattern in sidebar header

## Tailwind CSS v4 Configuration

### Key Changes from v3

| v3 Pattern | v4 Pattern |
|-----------|-----------|
| `tailwind.config.js` | CSS `@theme` directive |
| `tailwindcss-animate` plugin | `tw-animate-css` import |
| HSL color values | OKLCH color values |
| `@apply` in some contexts | Same, but theme vars via `@theme inline` |

### shadcn/ui Theme Setup (v4)

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... shadcn/ui generates these during init */
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... full theme variables */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark mode variables */
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 + tailwind.config.js | Tailwind v4 + CSS @theme directive | January 2025 | No JS config file needed; CSS-first configuration |
| tailwindcss-animate | tw-animate-css | March 2025 | Drop-in replacement for Tailwind v4 |
| HSL colors in shadcn/ui | OKLCH colors | 2025 | Better color space, wider gamut |
| forwardRef in components | React 19 ref as prop | React 19 / 2024 | Simpler component patterns |
| Next.js middleware (edge) | Next.js 16 proxy (nodejs) | Next.js 16 / 2025 | Not applicable if staying on Next.js 15 |
| Lucia Auth | better-auth | Early 2025 | Lucia deprecated; author recommends better-auth |
| NextAuth credentials | better-auth emailAndPassword | 2024-2025 | NextAuth treats email/password as second-class |

**Deprecated/outdated:**
- `tailwindcss-animate`: Use `tw-animate-css` instead (Tailwind v4)
- `Lucia Auth`: Deprecated early 2025, author recommends better-auth
- `forwardRef` in React 19: Use `ref` as a regular prop
- `tailwind.config.js` with Tailwind v4: Use CSS `@theme` directive instead

## Next.js 15 vs 16 Decision

| Factor | Next.js 15.5.x | Next.js 16.1.x |
|--------|----------------|----------------|
| Stability | Mature, well-tested | Newer, still stabilizing ecosystem |
| Middleware | `middleware.ts` with `middleware()` function | `proxy.ts` with `proxy()` function |
| Async APIs | Sync access has deprecation warnings but works | Sync access fully removed |
| Turbopack | Optional (--turbopack flag) | Default (must opt out with --webpack) |
| better-auth docs | Primary documentation target | Supported but docs still say "middleware" |
| Ecosystem | All tutorials, examples use middleware pattern | Community catching up |
| React Compiler | Experimental | Stable |

**Recommendation: Use Next.js 15.5.x for Phase 1.** Rationale:
1. better-auth documentation and examples primarily target Next.js 15 middleware pattern
2. The middleware-to-proxy rename is a disruptive change with little functional benefit for this project
3. Next.js 15.5.x receives backported security patches
4. Upgrade to 16 is straightforward later (rename middleware.ts to proxy.ts, ensure all async APIs)
5. The project needs stability for the foundation phase, not bleeding-edge features

## Open Questions

1. **better-auth organization metadata for company details**
   - What we know: Organizations have a `metadata` field (JSON string) that can store arbitrary data
   - What's unclear: Whether to store workspace company details (address, phone, logo URL) in organization metadata or in a separate workspace_settings table
   - Recommendation: Use organization metadata for basic company info (name, slug, logo already exist on organization). Create a separate `workspace_settings` table for additional details (address, phone, default currency, tax presets) that better-auth doesn't model. This keeps auth-managed data separate from business data.

2. **Custom roles beyond owner/member**
   - What we know: better-auth supports custom access control with `createAccessControl()` and custom role definitions
   - What's unclear: Whether the default owner/member roles need customization for InvoiceNest's specific permissions (e.g., member should be able to create invoices but not manage workspace settings)
   - Recommendation: Start with default roles for Phase 1. The default "member" role is read-only which is too restrictive. We will need custom access control statements to allow members to create/update resources (invoices, customers) while restricting workspace admin actions. Define this during planning.

3. **Invitation flow without email service**
   - What we know: better-auth requires a `sendInvitationEmail` callback. For v1, we don't have email infrastructure.
   - What's unclear: Best UX for invitations without real email delivery
   - Recommendation: For v1, generate invitation links and display them in the UI (copy to clipboard). The `sendInvitationEmail` callback can log the link to console in development. Add a "pending invitations" page where the owner can see and copy invitation links.

4. **Workspace slug in URL routing**
   - What we know: better-auth organizations have slugs. We could use `/[workspaceSlug]/dashboard` or just `/dashboard` with active organization in session.
   - What's unclear: Whether URL-based workspace routing adds value for a self-hosted tool
   - Recommendation: Use session-based active organization (simpler). The active organization is already stored on the session. URL-based routing adds complexity (slug validation, redirect logic) without clear benefit for a self-hosted tool where most users have one workspace.

## Sources

### Primary (HIGH confidence)
- [better-auth Organization Plugin docs](https://www.better-auth.com/docs/plugins/organization) - Full API reference, schema, configuration
- [better-auth Next.js Integration](https://www.better-auth.com/docs/integrations/next) - Route handler, middleware, server component patterns
- [better-auth Installation](https://www.better-auth.com/docs/installation) - Core setup, database config, email/password
- [better-auth Session Management](https://www.better-auth.com/docs/concepts/session-management) - Cookie config, expiration, caching
- [better-auth Drizzle Adapter](https://www.better-auth.com/docs/adapters/drizzle) - Schema generation, provider config
- [better-auth CLI](https://www.better-auth.com/docs/concepts/cli) - generate/migrate commands
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4) - Migration, compatibility, CSS changes
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - Init command, component adding
- [Drizzle ORM PostgreSQL Setup](https://orm.drizzle.team/docs/get-started-postgresql) - Driver config, connection
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations) - generate/migrate/push commands
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - Breaking changes from 15 to 16
- npm registry (2026-02-13) - Verified all package versions

### Secondary (MEDIUM confidence)
- [better-auth Next.js 16 Support Issue #5263](https://github.com/better-auth/better-auth/issues/5263) - Compatibility confirmed, closed as resolved
- [shadcn/ui Tailwind v4 Discussion #2996](https://github.com/shadcn-ui/ui/discussions/2996) - Community confirmation of v4 support
- [Next.js Multi-tenant Guide](https://nextjs.org/docs/app/guides/multi-tenant) - Official multi-tenancy patterns

### Tertiary (LOW confidence)
- Training data patterns for multi-tenant workspace isolation with Drizzle ORM (standard FK pattern is well-established but specific Drizzle idioms may evolve)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified against npm registry on 2026-02-13, official docs consulted for all libraries
- Architecture: HIGH - Patterns verified against better-auth official docs (organization plugin API, Next.js integration, Drizzle adapter)
- Pitfalls: HIGH - Session management, schema generation order, and workspace scoping are documented issues in better-auth and Drizzle communities
- UI/Tailwind v4: HIGH - shadcn/ui officially supports Tailwind v4, verified in docs and changelog

**Research date:** 2026-02-13
**Valid until:** 2026-03-15 (30 days -- stable ecosystem, better-auth is actively developed but core API is stable)

**Verified package versions (npm registry, 2026-02-13):**
| Package | Latest Version |
|---------|---------------|
| next | 16.1.6 (latest), 15.5.12 (latest 15.x) |
| react | 19.2.4 |
| better-auth | 1.4.18 |
| drizzle-orm | 0.45.1 |
| drizzle-kit | 0.31.9 |
| tailwindcss | 4.1.18 |
| postgres | 3.4.8 |
| zod | 4.3.6 |
| react-hook-form | 7.71.1 |
| @tanstack/react-query | 5.90.21 |
| lucide-react | 0.564.0 |
| @paralleldrive/cuid2 | 3.3.0 |
| @t3-oss/env-nextjs | 0.13.10 |
| clsx | 2.1.1 |
| tailwind-merge | 3.4.0 |
| tw-animate-css | 1.4.0 |
