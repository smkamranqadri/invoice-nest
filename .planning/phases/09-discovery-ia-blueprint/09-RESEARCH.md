# Phase 9: Discovery & IA Blueprint - Research

**Researched:** 2026-02-15  
**Domain:** Discovery information architecture and conversion-path blueprinting for v2.0  
**Confidence:** HIGH

## User Constraints

Constraints copied from `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/phases/09-discovery-ia-blueprint/09-CONTEXT.md` and treated as locked:

### Locked decisions
- Complexity is minimal.
- Path model is a single page with section jumps.
- Hero uses path cards on a shared page.
- Path labels:
  - Self-host operator
  - Business evaluator
- Path switching is hero-only (not persistent across full page chrome).
- Path success rule: user reaches the correct primary CTA within 2 interactions.
- Required artifacts:
  - sitemap
  - section map
  - acceptance checklist
- Top-level discovery nav is lean (max 5 items).
- Homepage flow: Value -> Path choice -> Proof -> CTA.
- Mandatory pages:
  - Home
  - Product
  - Self-host Quickstart
  - Docs
  - Pricing/Licensing
- CTA contract:
  - Operator primary CTA: Start Self-host Quickstart
  - Evaluator primary CTA: Create workspace
  - One fixed secondary CTA per path
  - Operator secondary: Create workspace
  - Evaluator secondary: Self-host Quickstart
  - CTA persistence: hero + sticky header CTA
  - Sticky CTA follows selected path after hero selection
- Trust and objection mapping:
  - Trust priorities: deployment clarity, data ownership, product maturity
  - Objections: setup effort, maintenance burden, migration risk
  - Placement: dedicated trust block before primary CTA + FAQ lower page
  - Proof format: concrete artifacts (not testimonial-led or claim-only)
- Acceptance matrix contract:
  - columns: operator path, evaluator path
  - required checks per cell: CTA reachability, trust presence, dead-end absence

### Claude's discretion
- Exact wording/tone of path labels on-page while preserving semantic intent.
- Exact visual layout of trust and FAQ sections.
- Exact microcopy of sticky CTA labels as long as target contracts stay fixed.

### Deferred ideas (out of scope)
- A/B testing framework for path/copy experiments.
- Variant copy/path experimentation system.
- Path-performance dashboards and deeper growth experimentation analytics.
- Recurring billing, gateways, or other new capability domains.

## Summary

Phase 9 planning should be treated as a deterministic blueprint-packaging phase, not exploratory design work. The strongest approach is to generate three explicit artifacts aligned with the locked context: a page-level sitemap spec, a section-level pathway/CTA/trust spec, and an acceptance matrix/checklist package that can be executed as validation in Phase 10/11.

The existing v2 planning stack already contains a stable source of truth in `09-CONTEXT.md`, `ROADMAP.md`, and `REQUIREMENTS.md`. Research therefore focuses on implementation discipline for planning artifacts: preventing ambiguity, preserving scope, and ensuring every entry surface has a non-dead-end action path for both audience tracks.

**Primary recommendation:** Plan Phase 9 as three execute plans in two waves: (1) IA backbone docs, (2) section + CTA + trust mapping docs, (3) acceptance matrix + scenario checklist + blueprint index.

## Standard Stack

### Core

| Tool / Pattern | Purpose | Why Standard |
|----------------|---------|--------------|
| Markdown planning artifacts under `.planning/phases/09-discovery-ia-blueprint/` | Phase outputs for downstream planning/execution | Consistent with repository planning workflow |
| Existing context contracts (`09-CONTEXT.md`, `ROADMAP.md`, `REQUIREMENTS.md`) | Source of truth for scope and decisions | Already decision-complete; avoids re-decision |
| Table-based validation matrix | Deterministic acceptance contract | Maps cleanly to DISC-01..DISC-04 checks |

### Supporting

| Tool / Pattern | Purpose | When to Use |
|----------------|---------|-------------|
| Requirement trace references (`DISC-*`) | Ensure blueprint ties to requirement scope | In each artifact's acceptance/coverage section |
| Entry-surface checklist | Dead-end and CTA reachability prevention | During final acceptance package generation |
| Blueprint index document | Single handoff map for Phase 10/11 | At the end of artifact assembly |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Structured multi-file artifact set | Single long context document only | Faster but harder for downstream execution planning |
| Deterministic matrix checks | Narrative acceptance prose | Ambiguity increases and verification weakens |
| Fixed page set contracts | Dynamic/optional page list | Reintroduces scope drift and late-stage rework |

**Installation:**
```bash
# No dependency installation required for Phase 9 planning artifacts.
```

## Architecture Patterns

### Recommended Artifact Structure

```text
.planning/phases/09-discovery-ia-blueprint/
├── 09-CONTEXT.md
├── 09-RESEARCH.md
├── 09-IA-SITEMAP.md
├── 09-SECTION-MAP.md
├── 09-CTA-PATH-CONTRACT.md
├── 09-TRUST-OBJECTION-MAP.md
├── 09-ACCEPTANCE-MATRIX.md
├── 09-SCENARIO-CHECKLIST.md
└── 09-BLUEPRINT-INDEX.md
```

### Pattern 1: Scope-Locked Blueprinting
**What:** Convert locked decisions into explicit artifacts without adding capabilities.  
**When to use:** Any doc section that could drift into feature expansion.  
**How to enforce:** Every artifact includes a phase-boundary note and deferred-ideas exclusion.

### Pattern 2: Dual-Path Determinism
**What:** Every key surface is evaluated for both operator and evaluator paths.  
**When to use:** CTA flows, trust placement, dead-end checks.  
**How to enforce:** Use a two-column matrix and require both cells for each row.

### Pattern 3: Goal-Backward Acceptance
**What:** Build validation checks backward from `DISC-01..DISC-04` and phase success criteria.  
**When to use:** Acceptance matrix and scenario checklist generation.  
**How to enforce:** Each checklist row maps to requirement IDs and pass criteria.

### Anti-Patterns to Avoid
- Mixing implementation design/system choices into Phase 9 outputs.
- Introducing alternate path models or extra personas not in locked decisions.
- Writing trust content as pure narrative claims without concrete proof artifacts.
- Creating matrix rows without both path columns completed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Acceptance quality | Ad hoc prose-only acceptance criteria | Deterministic matrix + scenario checklist | Keeps verification objective |
| Scope control | Implicit assumptions in plan text | Explicit boundary + deferred section in artifacts | Prevents scope creep |
| Path behavior | Generic CTA statements | Fixed path-specific CTA contracts | Reduces ambiguity for implementation |

**Key insight:** In blueprint phases, precision and traceability matter more than volume; structured contracts outperform longer narrative docs.

## Common Pitfalls

### Pitfall 1: Path ambiguity after hero selection
**What goes wrong:** Users can pick a path but later CTAs revert to generic behavior.  
**Why it happens:** CTA behavior is not explicitly state-bound to selected path.  
**How to avoid:** Lock sticky CTA follow behavior and verify in matrix rows.  
**Warning signs:** CTA labels/targets differ across sections without rule.

### Pitfall 2: Trust content added too late in flow
**What goes wrong:** Primary CTA appears before trust obligations are met.  
**Why it happens:** Page section order not locked in blueprint.  
**How to avoid:** Preserve `Value -> Path choice -> Proof -> CTA` ordering and explicit trust block before CTA.  
**Warning signs:** Objection handling appears only in footer or separate page.

### Pitfall 3: Dead-end entry surfaces
**What goes wrong:** Product/docs/pricing pages lack clear next action for one or both paths.  
**Why it happens:** Matrix does not include all key entry surfaces.  
**How to avoid:** Include mandatory pages + hero cards + sticky CTA as matrix rows.  
**Warning signs:** "Learn more" loops with no conversion action.

### Pitfall 4: Scope creep in blueprint phase
**What goes wrong:** Plans include A/B testing, dashboards, or new product capabilities.  
**Why it happens:** Deferred ideas not treated as hard exclusions.  
**How to avoid:** Carry deferred list in each plan and checker validation criteria.  
**Warning signs:** Plan tasks mention experimentation frameworks or feature additions.

## Code Examples

Planning-file patterns from this repo to preserve:

### Structured plan frontmatter
```yaml
phase: 09-discovery-ia-blueprint
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
must_haves:
  truths: []
  artifacts: []
  key_links: []
```
Source: `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/phases/05-dashboard-settings-polish/05-03-PLAN.md`

### Matrix validation style
```markdown
| Entry Surface | Operator Path Checks | Evaluator Path Checks |
|---------------|----------------------|-----------------------|
| Home | ... | ... |
```
Source: `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/phases/09-discovery-ia-blueprint/09-CONTEXT.md`

## State of the Art

| Older Pattern | Current Pattern | Impact |
|---------------|-----------------|--------|
| Narrative-only planning docs | Contract-style docs with explicit checks | Better execution reliability |
| Generic CTA language | Path-specific CTA mapping | Faster downstream implementation |
| Implicit verification | Matrix/checklist-based verification | Lower interpretation risk |

## Open Questions

1. **Whether to include optional non-mandatory entry surfaces in matrix (e.g., blog/docs subpages).**
   - What we know: Mandatory surfaces are fixed.
   - What's unclear: Optional expansion for future-proofing.
   - Recommendation: Keep Phase 9 matrix strict to mandatory surfaces only; optional surfaces can be added in later phases if needed.

## Sources

### Primary (HIGH confidence)
- `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/phases/09-discovery-ia-blueprint/09-CONTEXT.md`
- `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/ROADMAP.md`
- `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/REQUIREMENTS.md`
- `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/PROJECT.md`
- `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/phases/05-dashboard-settings-polish/05-03-PLAN.md`

### Secondary (MEDIUM confidence)
- `/Users/mkamran/.codex/skills/gsd-plan-phase/references/agents/gsd-planner.md`
- `/Users/mkamran/.codex/skills/gsd-plan-phase/references/get-shit-done/workflows/plan-phase.md`

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- User constraints extraction: HIGH (verbatim from locked context)
- Artifact structure: HIGH (aligned to existing repo planning conventions)
- Pitfall analysis: MEDIUM-HIGH (domain/process derived)

**Research date:** 2026-02-15  
**Valid until:** 2026-03-15
