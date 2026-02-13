# Phase 2: Customer Management - Research

**Researched:** 2026-02-13
**Domain:** CRUD entity management with search, filtering, and soft status toggle within a multi-tenant workspace
**Confidence:** HIGH (this phase uses only libraries already installed and patterns already established in Phase 1; no new dependencies required)

## Summary

Phase 2 adds the first custom domain entity (customers) to the existing Phase 1 foundation. This is a well-bounded CRUD module: a new `customer` table scoped to the active organization via `organizationId` foreign key, server actions for mutations, server-component data fetching with Drizzle queries, and client-side UI using the same shadcn/ui + react-hook-form + Zod v4 patterns already established in Phase 1.

The key architectural insight is that **no new libraries are needed**. Every dependency is already installed: Drizzle ORM for schema/queries, Zod v4 for validation, react-hook-form with `@hookform/resolvers` for forms, shadcn/ui components (table, dialog, input, badge, card), `@paralleldrive/cuid2` for ID generation, and sonner for toasts. The sidebar already has a "Customers" nav item pointing to `/customers`.

The main design decisions are: (1) the customer table schema with workspace scoping via `organizationId`, (2) using Next.js Server Actions (`"use server"`) for create/edit/deactivate mutations rather than API routes (aligning with Next.js 15 App Router patterns and keeping the codebase consistent with the plan for future phases), (3) server-component data fetching for the customer list and detail pages, and (4) a soft-status pattern using an `isActive` boolean column with `true` as default.

**Primary recommendation:** Add a `customer` schema file to `src/lib/db/schema/`, create server actions in `src/lib/actions/customer.ts`, build the customer list page at `src/app/(dashboard)/customers/page.tsx` with a detail page at `src/app/(dashboard)/customers/[id]/page.tsx`, and follow the existing members-page pattern (server component fetches data, passes to client component for interactivity).

## Standard Stack

### Core (already installed -- no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Drizzle ORM | ^0.45.1 | Customer table schema, queries, migrations | Already used for auth tables; type-safe SQL |
| drizzle-kit | ^0.31.9 | Generate migration for customer table | Already used for auth migration |
| Zod | ^4.3.6 | Customer form validation (client + server) | Already used for workspace settings form |
| react-hook-form | ^7.71.1 | Customer add/edit form state | Already used for workspace settings |
| @hookform/resolvers | ^5.2.2 | Zod-to-RHF bridge | Already installed |
| @paralleldrive/cuid2 | ^3.3.0 | Customer ID generation | Already installed, not yet used in custom code |
| sonner | ^2.0.7 | Toast notifications for CRUD feedback | Already used throughout |
| lucide-react | ^0.564.0 | Icons for customer UI | Already used throughout |

### shadcn/ui Components (already installed)

| Component | File | Use Case |
|-----------|------|----------|
| Table | `src/components/ui/table.tsx` | Customer list |
| Dialog | `src/components/ui/dialog.tsx` | Add/edit customer modal |
| Input | `src/components/ui/input.tsx` | Form fields |
| Textarea | `src/components/ui/textarea.tsx` | Address field |
| Form | `src/components/ui/form.tsx` | Form wrapper with validation |
| Card | `src/components/ui/card.tsx` | Customer detail page layout |
| Badge | `src/components/ui/badge.tsx` | Active/inactive status indicator |
| Button | `src/components/ui/button.tsx` | Actions |
| Select | `src/components/ui/select.tsx` | Status filter dropdown |
| Skeleton | `src/components/ui/skeleton.tsx` | Loading states |
| Separator | `src/components/ui/separator.tsx` | Section dividers |
| Tabs | `src/components/ui/tabs.tsx` | Customer detail page (info tab, invoices tab) |

### New shadcn/ui Components Potentially Needed

| Component | Purpose | Install Command |
|-----------|---------|-----------------|
| DropdownMenu | Row actions (edit, deactivate) | Already installed (`src/components/ui/dropdown-menu.tsx`) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Actions | API Route Handlers (`app/api/customers/route.ts`) | API routes are more RESTful but add boilerplate; Server Actions are simpler for form mutations in App Router and are the Next.js 15 recommended pattern. Use Server Actions. |
| Dialog for add/edit | Separate page for add/edit | Dialog keeps the user in context and is faster for simple forms. Customer form has ~5 fields; a dialog is appropriate. Full page would be overkill. |
| Client-side search | Server-side search with URL params | Server-side with `searchParams` is simpler, works without JS, and integrates with Next.js caching. Use `useSearchParams` + URL-based filtering. |
| `ilike` for search | Full-text search (tsvector) | `ilike` with `%query%` is sufficient for name/email search at the scale of a small business customer list (hundreds, not millions). No need for full-text search. |

**Installation:**
```bash
# No new packages needed!

# Only shadcn components if any are missing (check first):
npx shadcn@latest add dropdown-menu  # Already installed

# Generate migration after adding customer schema:
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── auth.ts          # Existing: better-auth tables
│   │   │   ├── customer.ts      # NEW: customer table + relations
│   │   │   └── index.ts         # Updated: export customer schema
│   │   ├── migrations/          # NEW migration generated by drizzle-kit
│   │   └── index.ts             # Existing: db connection
│   ├── actions/
│   │   └── customer.ts          # NEW: server actions (create, update, toggleStatus)
│   ├── queries/
│   │   ├── workspace.ts         # Existing
│   │   ├── members.ts           # Existing
│   │   └── customer.ts          # NEW: server-side query functions
│   └── validations/
│       └── customer.ts          # NEW: Zod schemas for customer forms
├── app/(dashboard)/
│   ├── customers/
│   │   ├── page.tsx             # NEW: customer list (server component)
│   │   ├── customers-client.tsx # NEW: client interactivity (search, filter, dialogs)
│   │   └── [id]/
│   │       └── page.tsx         # NEW: customer detail page (server component)
│   └── ...
├── components/
│   ├── customers/
│   │   ├── customer-form.tsx       # NEW: add/edit form (used in dialog)
│   │   ├── customer-table.tsx      # NEW: customer list table
│   │   ├── customer-status-badge.tsx # NEW: active/inactive badge
│   │   └── customer-detail.tsx     # NEW: detail page content
│   └── ...
```

### Pattern 1: Customer Table Schema with Organization Scoping

**What:** Customer table with `organizationId` foreign key referencing the `organization` table from better-auth. Every query filters by `organizationId` to enforce workspace isolation.

**When to use:** Every custom domain entity in this application (customers, invoices, payments).

**Example:**
```typescript
// src/lib/db/schema/customer.ts
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organization } from "./auth";

export const customer = pgTable(
  "customer",
  {
    id: text("id").primaryKey(),            // cuid2
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),                    // nullable -- not all customers have email
    phone: text("phone"),                    // nullable
    address: text("address"),               // nullable, free-form text
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("customer_organizationId_idx").on(table.organizationId),
    index("customer_organizationId_name_idx").on(table.organizationId, table.name),
    index("customer_organizationId_email_idx").on(table.organizationId, table.email),
  ],
);

export const customerRelations = relations(customer, ({ one }) => ({
  organization: one(organization, {
    fields: [customer.organizationId],
    references: [organization.id],
  }),
  // invoices relation will be added in Phase 3
}));
```

**Key design decisions:**
- `email` is nullable: not every small-business customer has an email on file
- `address` as single text field (not structured): keeps it simple for v1, multi-line textarea in UI
- `isActive` boolean (not `status` enum): only two states needed (active/inactive), boolean is simpler
- `organizationId` with cascade delete: if workspace is deleted, all its customers go too
- Composite indexes on `(organizationId, name)` and `(organizationId, email)` for search queries

### Pattern 2: Server Actions for Mutations

**What:** Use Next.js Server Actions (`"use server"` functions) for create, update, and deactivate operations. This avoids building API route handlers for simple CRUD.

**When to use:** All customer mutations.

**Example:**
```typescript
// src/lib/actions/customer.ts
"use server";

import { db } from "@/lib/db";
import { customer } from "@/lib/db/schema";
import { getRequiredOrganization } from "@/lib/queries/workspace";
import { createCustomerSchema } from "@/lib/validations/customer";
import { createId } from "@paralleldrive/cuid2";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: unknown) {
  const { organizationId } = await getRequiredOrganization();
  const parsed = createCustomerSchema.safeParse(formData);

  if (!parsed.success) {
    return { error: "Invalid customer data" };
  }

  const [newCustomer] = await db
    .insert(customer)
    .values({
      id: createId(),
      organizationId,
      ...parsed.data,
    })
    .returning();

  revalidatePath("/customers");
  return { data: newCustomer };
}
```

### Pattern 3: Server-Component Data Fetching with Query Functions

**What:** Reusable query functions in `src/lib/queries/customer.ts` called from server components. Follows the existing pattern from `workspace.ts` and `members.ts`.

**When to use:** All customer list and detail page data fetching.

**Example:**
```typescript
// src/lib/queries/customer.ts
import { db } from "@/lib/db";
import { customer } from "@/lib/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";

export async function getCustomers(
  organizationId: string,
  options?: { search?: string; status?: "active" | "inactive" | "all" }
) {
  const conditions = [eq(customer.organizationId, organizationId)];

  if (options?.status === "active") {
    conditions.push(eq(customer.isActive, true));
  } else if (options?.status === "inactive") {
    conditions.push(eq(customer.isActive, false));
  }

  if (options?.search) {
    const searchTerm = `%${options.search}%`;
    conditions.push(
      or(
        ilike(customer.name, searchTerm),
        ilike(customer.email, searchTerm),
      )!
    );
  }

  return db
    .select()
    .from(customer)
    .where(and(...conditions))
    .orderBy(desc(customer.createdAt));
}

export async function getCustomerById(organizationId: string, customerId: string) {
  const [result] = await db
    .select()
    .from(customer)
    .where(
      and(
        eq(customer.id, customerId),
        eq(customer.organizationId, organizationId),
      )
    );
  return result ?? null;
}
```

### Pattern 4: URL-Based Search and Filtering

**What:** Use URL search params (`?search=acme&status=active`) for search and filter state. The server component reads `searchParams`, passes them to query functions. Client component updates the URL using `useRouter` and `useSearchParams`.

**When to use:** Customer list page filtering.

**Why:** Shareable URLs, works with browser back/forward, server-side rendering of filtered results, no client state to synchronize.

**Example:**
```typescript
// In page.tsx (server component)
export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { organizationId } = await getRequiredOrganization();
  const customers = await getCustomers(organizationId, {
    search: params.search,
    status: (params.status as "active" | "inactive" | "all") ?? "all",
  });
  // ...render
}
```

### Pattern 5: Client Component with Server-Fetched Initial Data

**What:** Server component fetches data and passes it to a client component as props. Client component handles interactivity (search input, filter dropdowns, dialog open/close, optimistic updates). This is the exact pattern used in the members page.

**When to use:** Customer list page (same as `members-client.tsx` pattern).

**Example flow:**
```
page.tsx (server) -> fetches customers -> passes to customers-client.tsx (client)
customers-client.tsx -> renders search bar, filter, table, add/edit dialogs
                     -> calls server actions for mutations
                     -> uses router.push() to update URL params for search/filter
```

### Anti-Patterns to Avoid

- **Forgetting organizationId in queries:** Every customer query MUST filter by `organizationId`. Use the query function pattern (Pattern 3) to centralize this. Never query the customer table without workspace scoping.
- **Client-side filtering for small datasets:** Even though the customer list may be small, keep filtering server-side via URL params. This establishes the correct pattern for invoices (which will be larger) and avoids loading all customers on page load.
- **Separate add and edit forms:** Use a single `CustomerForm` component that accepts optional initial data. If `initialData` is provided, it's edit mode; otherwise, it's create mode. Avoid duplicating form logic.
- **Hard delete:** Requirements explicitly state soft delete via status toggle. Never add a delete action. Use deactivate/reactivate instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | Zod v4 schema + react-hook-form `zodResolver` | Already established pattern in workspace settings form |
| ID generation | `Math.random()` or UUID | `createId()` from `@paralleldrive/cuid2` | Collision-resistant, URL-safe, consistent with better-auth pattern |
| Search debouncing | Custom debounce with setTimeout | `useDeferredValue` from React 19 or simple setTimeout in `useEffect` | React 19's `useDeferredValue` handles the common case; for URL-based search a 300ms debounce before `router.push` is sufficient |
| Toast notifications | Custom notification system | `toast.success()` / `toast.error()` from sonner | Already installed and configured with `richColors` |
| Table component | Custom table HTML | shadcn/ui `Table` components | Already installed, consistent styling |
| Loading states | Custom loading logic | React `Suspense` + `loading.tsx` convention or shadcn `Skeleton` | Next.js built-in pattern |

**Key insight:** Phase 2 requires zero new libraries. The entire feature is built with tools already in the project from Phase 1.

## Common Pitfalls

### Pitfall 1: Zod v4 API Differences

**What goes wrong:** Using Zod v3 APIs that changed in v4. The project uses Zod 4.3.6.
**Why it happens:** Most tutorials and examples online still show Zod v3 syntax.
**How to avoid:** Key Zod v4 changes to be aware of:
- `z.infer<typeof schema>` still works (unchanged)
- `safeParse` still works (unchanged)
- `z.string().email()` still works (unchanged)
- `z.object()` still works (unchanged)
- Error formatting: `error.flatten()` and `error.format()` still exist but `error.issues` is the primary way
- `zodResolver` from `@hookform/resolvers/zod` works with Zod v4 (verified: `@hookform/resolvers` ^5.2.2 supports Zod v4)
**Warning signs:** TypeScript errors on Zod schema definitions; look for v3-specific APIs.

### Pitfall 2: Missing Organization Scoping

**What goes wrong:** A customer query returns customers from other workspaces, or a customer is created without an `organizationId`.
**Why it happens:** Forgetting to include `organizationId` in WHERE clauses or insert values.
**How to avoid:** Always use `getRequiredOrganization()` at the top of every server action and query function. The query function pattern (Pattern 3) centralizes this. Never expose raw Drizzle queries in page components.
**Warning signs:** Customer list shows unexpected entries; editing a customer from another workspace succeeds.

### Pitfall 3: searchParams Must Be Awaited in Next.js 15

**What goes wrong:** `searchParams` is used synchronously in a server component, causing a runtime error or type error.
**Why it happens:** In Next.js 15, `searchParams` is a `Promise` that must be awaited. This changed from Next.js 14.
**How to avoid:** Always `const params = await searchParams;` before accessing properties. The page component type is `{ searchParams: Promise<{ ... }> }`.
**Warning signs:** TypeScript error about `searchParams` being a Promise; runtime "Cannot read property of undefined".

### Pitfall 4: Drizzle `or()` Returns Possibly Undefined

**What goes wrong:** TypeScript error when using `or()` in a `where()` clause because `or()` can return `undefined`.
**Why it happens:** Drizzle's `or()` type signature allows undefined when called with no arguments.
**How to avoid:** Use the non-null assertion `or(...)!` when you know you're passing at least one condition, or wrap in a null check.
**Warning signs:** TypeScript error: "Argument of type 'SQL | undefined' is not assignable to parameter of type 'SQL'".

### Pitfall 5: Sonner Toast richColors

**What goes wrong:** Success/error toasts appear without color styling.
**Why it happens:** Sonner requires the `richColors` prop on the `<Toaster>` component. The project has this fixed in Phase 1 (quick task 3).
**How to avoid:** Already fixed. Just use `toast.success()` and `toast.error()` -- they will be colored.
**Warning signs:** Toasts are plain white/dark without green/red tints.

### Pitfall 6: Outstanding Balance Placeholder

**What goes wrong:** Trying to compute CUST-06 (outstanding balance) when invoices don't exist yet.
**Why it happens:** Phase 3 (invoices) hasn't been built. CUST-06 says "sum of unpaid invoices" but there are no invoices.
**How to avoid:** Show `$0.00` as the outstanding balance on the customer detail page. Add a placeholder comment in the code: `// TODO Phase 3: compute from invoices table`. The balance will become functional when invoices are implemented.
**Warning signs:** N/A -- this is expected behavior.

## Code Examples

Verified patterns from the existing codebase and official documentation:

### Customer Zod Validation Schema (Zod v4)

```typescript
// src/lib/validations/customer.ts
import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters")
    .optional()
    .or(z.literal("")),   // Allow empty string from form, treat as no email
  phone: z
    .string()
    .max(50, "Phone must be at most 50 characters")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(500, "Address must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

export const updateCustomerSchema = createCustomerSchema;

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
```

### Server Action with Validation and Org Scoping

```typescript
// src/lib/actions/customer.ts
"use server";

import { db } from "@/lib/db";
import { customer } from "@/lib/db/schema";
import { getRequiredOrganization } from "@/lib/queries/workspace";
import { createCustomerSchema, updateCustomerSchema } from "@/lib/validations/customer";
import { createId } from "@paralleldrive/cuid2";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCustomer(input: unknown) {
  const { organizationId } = await getRequiredOrganization();
  const parsed = createCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid customer data" };
  }

  const [newCustomer] = await db
    .insert(customer)
    .values({
      id: createId(),
      organizationId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
    })
    .returning();

  revalidatePath("/customers");
  return { data: newCustomer };
}

export async function updateCustomer(customerId: string, input: unknown) {
  const { organizationId } = await getRequiredOrganization();
  const parsed = updateCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid customer data" };
  }

  const [updated] = await db
    .update(customer)
    .set({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
    })
    .where(and(eq(customer.id, customerId), eq(customer.organizationId, organizationId)))
    .returning();

  if (!updated) {
    return { error: "Customer not found" };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { data: updated };
}

export async function toggleCustomerStatus(customerId: string) {
  const { organizationId } = await getRequiredOrganization();

  // First fetch current status
  const [existing] = await db
    .select({ isActive: customer.isActive })
    .from(customer)
    .where(and(eq(customer.id, customerId), eq(customer.organizationId, organizationId)));

  if (!existing) {
    return { error: "Customer not found" };
  }

  const [updated] = await db
    .update(customer)
    .set({ isActive: !existing.isActive })
    .where(and(eq(customer.id, customerId), eq(customer.organizationId, organizationId)))
    .returning();

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { data: updated };
}
```

### Drizzle Migration Generation

```bash
# After adding the customer schema and updating schema/index.ts:
npx drizzle-kit generate
# This creates a new migration file in src/lib/db/migrations/
npx drizzle-kit migrate
# This applies the migration to the database
```

### Customer Form Component (react-hook-form + Zod v4)

```typescript
// Follows exact same pattern as workspace-settings-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCustomerSchema, type CreateCustomerInput } from "@/lib/validations/customer";
import { createCustomer, updateCustomer } from "@/lib/actions/customer";
import { toast } from "sonner";
// ... shadcn/ui Form, FormField, FormItem, FormLabel, FormControl, FormMessage

interface CustomerFormProps {
  initialData?: { id: string; name: string; email: string | null; phone: string | null; address: string | null };
  onSuccess?: () => void;
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
  const isEditing = !!initialData;
  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
    },
  });

  async function onSubmit(values: CreateCustomerInput) {
    const result = isEditing
      ? await updateCustomer(initialData!.id, values)
      : await createCustomer(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? "Customer updated" : "Customer added");
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* FormField for name, email, phone, address */}
      </form>
    </Form>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| API Route Handlers for CRUD | Server Actions (`"use server"`) | Next.js 14+ (stable) | Simpler mutations, no manual fetch calls, automatic revalidation |
| `getServerSideProps` | Server Components with `async` functions | Next.js 13+ App Router | Direct DB access in components, no API layer needed for reads |
| Zod v3 `z.string().optional()` | Zod v4 (same API, minor internal changes) | Zod v4.0 (2025) | Mostly backward compatible; `@hookform/resolvers` ^5.x supports v4 |
| `searchParams` as sync object | `searchParams` as `Promise` | Next.js 15 | Must await before accessing properties |

**Deprecated/outdated:**
- `getServerSideProps` / `getStaticProps`: Replaced by server components in App Router
- `pages/api/` routes: Still supported but `app/` route handlers or server actions are preferred
- Zod v3: The project uses v4; ensure code examples match v4 syntax

## Open Questions

1. **Email uniqueness per organization?**
   - What we know: The requirements don't specify whether customer email must be unique within a workspace. Two customers with the same email could be valid (e.g., a person who represents multiple companies).
   - What's unclear: Should we enforce unique email per organization?
   - Recommendation: Do NOT enforce uniqueness. Email is optional and multiple customers can share an email. If needed later, add a unique constraint. Simpler to add constraints than remove them.

2. **Customer notes/internal comments?**
   - What we know: Requirements specify name, email, phone, address. No mention of a notes field.
   - What's unclear: Would a freeform notes field be useful?
   - Recommendation: Leave it out for now. Requirements don't include it. Can be added in a future quick task if the user wants it.

3. **Outstanding balance computation (CUST-06)**
   - What we know: This requires summing unpaid invoices, but invoices don't exist until Phase 3.
   - What's unclear: Nothing -- this is a known dependency.
   - Recommendation: Display `$0.00` as a placeholder on the customer detail page. Add a clear code comment marking where the real computation will go. The customer detail page structure should include the balance display area so Phase 3 can simply fill in the logic.

4. **Invoice history on customer detail (CUST-05)**
   - What we know: Same as above -- invoices don't exist yet.
   - What's unclear: Nothing.
   - Recommendation: Show an empty state message like "No invoices yet" on the customer detail page. The UI structure (tab or section) should be in place so Phase 3 can populate it.

## Sources

### Primary (HIGH confidence)
- **Existing codebase analysis** -- All patterns verified by reading actual source files:
  - `src/lib/db/schema/auth.ts` -- Table definition pattern, relations, indexes
  - `src/components/workspace/workspace-settings-form.tsx` -- Form pattern (react-hook-form + Zod + shadcn/ui)
  - `src/app/(dashboard)/members/members-client.tsx` -- Server-fetch + client-interactivity pattern
  - `src/lib/queries/workspace.ts` -- Server-side query function pattern
  - `src/components/layout/app-sidebar.tsx` -- Sidebar already has `/customers` nav item
  - `drizzle.config.ts` -- Migration output directory and schema path
  - `package.json` -- All dependencies verified with exact versions

### Secondary (MEDIUM confidence)
- Drizzle ORM `ilike` operator for case-insensitive search -- standard PostgreSQL pattern, well-documented in Drizzle docs
- Next.js 15 `searchParams` as Promise -- verified by the existing codebase using Next.js 15.5.12 with async patterns
- Server Actions pattern -- standard Next.js 15 App Router feature

### Tertiary (LOW confidence)
- None -- all findings verified against the existing codebase or established library patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all verified in `package.json`
- Architecture: HIGH -- follows exact patterns from Phase 1 codebase (members page, workspace settings form, query functions)
- Pitfalls: HIGH -- all pitfalls identified from actual codebase analysis (Zod v4, searchParams Promise, Drizzle `or()` typing)
- Code examples: HIGH -- all examples follow patterns verified in existing source files

**Research date:** 2026-02-13
**Valid until:** 2026-04-13 (60 days -- stack is stable, no new dependencies involved)
