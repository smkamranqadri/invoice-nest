---
phase: quick-4
plan: 1
type: execute
wave: 1
depends_on: []
files_modified: [src/app/page.tsx]
autonomous: true

must_haves:
  truths:
    - "Unauthenticated user sees a modern landing page at /"
    - "Hero section clearly communicates InvoiceNest's value proposition"
    - "Features section highlights 3-4 key capabilities with icons"
    - "User can navigate to sign-up or sign-in from the landing page"
    - "Footer provides basic links and attribution"
  artifacts:
    - path: "src/app/page.tsx"
      provides: "Landing page component replacing Next.js boilerplate"
      min_lines: 80
  key_links:
    - from: "src/app/page.tsx"
      to: "Button component"
      via: "import from @/components/ui/button"
      pattern: "import.*Button"
    - from: "src/app/page.tsx"
      to: "/sign-up and /sign-in"
      via: "href props on CTA buttons"
      pattern: "href.*sign-(up|in)"
---

<objective>
Replace the Next.js boilerplate landing page with a clean, modern landing page that introduces InvoiceNest's value proposition and guides users to sign up or sign in.

Purpose: Create a professional first impression for the app and drive users toward authentication
Output: Updated src/app/page.tsx with hero, features, and footer sections
</objective>

<execution_context>
@/Users/mkamran/Repositores/side-projects/invoice-nest-v5/src/components/ui/button.tsx
@/Users/mkamran/Repositores/side-projects/invoice-nest-v5/src/app/page.tsx
</execution_context>

<context>
# Project Context
- InvoiceNest is a self-hosted invoicing workspace app
- Core value: Teams create invoices, send to customers, know exactly who owes what—without spreadsheets or expensive SaaS
- Stack: Next.js 15, Tailwind CSS v4, shadcn/ui, lucide-react icons
- Primary color: emerald green (oklch(0.596 0.165 166))
- Auth pages exist at /sign-in and /sign-up
- Dashboard at /dashboard (protected)

# Design System
- Uses Button component from @/components/ui/button with variants: default, outline, secondary, ghost, link
- Geist fonts (via Next.js defaults)
- Tailwind CSS v4 for styling
- No new components needed—use built-in HTML + Button component + lucide-react icons
</context>

<tasks>

<task type="auto">
  <name>Build landing page hero, features, and footer</name>
  <files>src/app/page.tsx</files>
  <action>
Replace the Next.js boilerplate page.tsx with a professional landing page. Structure:

1. **Hero section** (viewport height):
   - Centered heading: "Teams that ship faster" or similar (emphasizing team/speed)
   - Subheading: "Create invoices, send them, know exactly who owes what—without spreadsheets or expensive SaaS tools"
   - Two CTA buttons: "Get Started" (href="/sign-up", variant="default"), "Sign In" (href="/sign-in", variant="outline")
   - Use h1, p tags, and Button component
   - Use Tailwind grid/flex for layout, primary color accents on hero text or buttons

2. **Features section**:
   - 3-4 key features with lucide-react icons (e.g., FileText, Users, Clock, CheckCircle2)
   - Feature examples:
     - Workspace collaboration (Users icon)
     - Create & send invoices (FileText icon)
     - Real-time tracking (Clock icon)
   - Card-like appearance using Tailwind border/shadow utilities
   - Two columns on desktop (md:), stacked on mobile
   - Short 1-line description per feature

3. **Footer**:
   - Simple footer with basic links (e.g., "About", "GitHub", "Privacy")
   - Use lucide-react for optional icon embellishment
   - Subtle styling, text-sm, muted colors (text-muted-foreground)

4. **Styling**:
   - Remove unused Image imports and SVG references from boilerplate
   - Use Tailwind classes: grid, flex, gap-*, p-*, sm:*, md:* responsive prefixes
   - Apply primary color (oklch(0.596 0.165 166)) to hero CTA or accent text
   - Keep layout minimal and professional—no animations or excessive whitespace
   - Ensure dark mode works (use dark: prefixes)

**Do NOT:**
- Add new component files or dependencies
- Use images or external assets (only lucide icons)
- Over-engineer—keep to a single page.tsx file
  </action>
  <verify>
Run `npm run dev` and navigate to http://localhost:3000. Verify:
1. Page renders without errors (check browser console)
2. Hero section is visible with heading, description, and two buttons
3. Buttons link to /sign-up and /sign-in (test manually or inspect href)
4. Features section displays 3-4 cards with icons and descriptions
5. Footer is present at bottom with links
6. Layout is responsive: stacks on mobile, spreads on desktop
7. Dark mode works (toggle in browser if available)
8. No unused imports or console warnings
  </verify>
  <done>
Landing page renders correctly at / with:
- Hero section (heading, subheading, dual CTAs)
- Features section (3-4 cards with icons)
- Footer (links)
- Responsive layout (mobile & desktop)
- No build/lint errors
- Dark mode support
  </done>
</task>

</tasks>

<verification>
Run `npm run build` to ensure the page compiles without errors. Manually test:
- Navigate to home page and verify all sections render
- Click "Get Started" button → should go to /sign-up
- Click "Sign In" button → should go to /sign-in
- Resize browser window → layout should respond (mobile → tablet → desktop)
- Toggle dark mode (if available) → page should adapt
</verification>

<success_criteria>
- Landing page displays at / replacing the boilerplate
- Hero section conveys InvoiceNest's core value prop
- Features are clearly highlighted with icons
- CTAs drive users to sign-up or sign-in flows
- Design is professional, consistent with existing design system
- Fully responsive and dark-mode compatible
- No build errors or warnings
</success_criteria>

<output>
After completion, create `.planning/quick/4-create-landing-page-for-invoicenest/4-SUMMARY.md` with:
- Overview of landing page structure and design choices
- Key sections built (hero, features, footer)
- Responsive breakpoints applied
- Color/typography decisions
- Time to completion
</output>
