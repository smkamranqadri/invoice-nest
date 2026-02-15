# Phase 9: Discovery & IA Blueprint - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 9 is blueprint-only and defines how first-time visitors move from discovery to action for v2.0.

This phase must lock:
- two clear primary audience paths
- sitemap + section map + acceptance checklist
- deterministic CTA behavior and mappings
- trust and objection placement rules

This phase must not add new product capabilities.

</domain>

<decisions>
## Implementation Decisions

### Audience Pathways
- Complexity is minimal.
- Path model is a single page with section jumps.
- Hero uses path cards on a shared page.
- Path labels are:
  - Self-host operator
  - Business evaluator
- Path switching is hero-only, not persistent across full page chrome.
- Path success rule: user reaches the correct primary CTA within 2 interactions.

### IA Blueprint Structure
- Required artifact set:
  - sitemap
  - section map
  - acceptance checklist
- Top-level discovery navigation is lean, max 5 items.
- Homepage section flow is:
  1. Value
  2. Path choice
  3. Proof
  4. CTA
- Mandatory sitemap pages:
  - Home
  - Product
  - Self-host Quickstart
  - Docs
  - Pricing/Licensing

### CTA Architecture
- Operator primary CTA: Start Self-host Quickstart.
- Evaluator primary CTA: Create workspace.
- Secondary CTA policy: exactly one fixed secondary CTA per path.
- Fixed secondary CTA mapping:
  - Operator secondary: Create workspace
  - Evaluator secondary: Self-host Quickstart
- CTA persistence: hero CTA plus sticky header CTA.
- Sticky behavior: sticky CTA follows selected path after hero selection.

### Trust and Objection Mapping
- Trust priorities are:
  - deployment clarity
  - data ownership
  - product maturity
- Required objection cluster:
  - setup effort
  - maintenance burden
  - migration risk
- Placement rule:
  - dedicated trust block before primary CTA
  - FAQ section lower on page
- Proof format must be concrete artifacts, not testimonial-led or claim-only copy.

### Acceptance Matrix Contract
- Matrix columns:
  - Operator path
  - Evaluator path
- Required checks in every matrix cell:
  - path CTA reachability
  - trust placement presence
  - dead-end absence

| Entry Surface | Operator Path Checks | Evaluator Path Checks |
|---------------|----------------------|-----------------------|
| Home | Reach operator primary CTA in <=2 interactions; trust block appears before CTA; no dead ends | Reach evaluator primary CTA in <=2 interactions; trust block appears before CTA; no dead ends |
| Product | Next action routes to operator flow or operator secondary fallback; trust cues present; no dead ends | Next action routes to evaluator flow or evaluator secondary fallback; trust cues present; no dead ends |
| Self-host Quickstart | Primary action remains setup-oriented with clear next step; trust cues present; no dead ends | Evaluator fallback path to quickstart is explicit and reversible; trust cues present; no dead ends |
| Docs | Operator-intent path to quickstart and setup certainty is obvious; trust cues present; no dead ends | Evaluator path to product/workspace action is obvious; trust cues present; no dead ends |
| Pricing/Licensing | Operator fallback path to workspace action is available; trust cues present; no dead ends | Evaluator primary action is clear after pricing/licensing scan; trust cues present; no dead ends |
| Hero path cards (Home) | Card selection leads to operator section/CTA in <=2 interactions; no ambiguous branches | Card selection leads to evaluator section/CTA in <=2 interactions; no ambiguous branches |
| Sticky header CTA | CTA updates to operator action after path selection; never routes to dead end | CTA updates to evaluator action after path selection; never routes to dead end |

### Claude's Discretion
- Exact wording/tone of path labels on-page (while preserving locked semantic intent).
- Exact visual layout of trust and FAQ sections.
- Exact microcopy for sticky CTA labels, as long as target contracts remain fixed.

</decisions>

<specifics>
## Specific Ideas

- Keep the discovery experience intentionally simple: one shared page, two obvious path cards, and deterministic next actions.
- Use path-specific CTA behavior without multiplying navigation complexity.
- Treat trust as operational proof (setup reality, ownership clarity, maturity evidence), not marketing-only claims.
- Validate every mandatory page and key entry surface with the matrix to prevent dead ends.

</specifics>

<deferred>
## Deferred Ideas

- A/B testing framework for path and copy experiments.
- Variant copy/path experimentation system.
- Path-performance dashboards and deeper growth experimentation analytics.
- Any expansion into recurring billing, payment gateways, or other new capability domains.

</deferred>

---

*Phase: 09-discovery-ia-blueprint*
*Context gathered: 2026-02-15*
