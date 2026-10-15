# Phase 9 Page Specs Contract

## Purpose
Define per-page behavior and path continuity so discovery implementation can proceed without interpretation drift.

## Phase Boundary
- This document is blueprint-only and contains no visual implementation design.
- This phase is out of scope for new capability delivery.
- Page specs define structure and behavior contracts only.

## Global Discovery Behavior Rules
- Required homepage sequence: Value -> Path choice -> Proof -> CTA.
- All discovery pages must preserve continuity for both operator and evaluator paths.
- Every primary landing page must provide a next action with no dead ends.
- Path success target remains: user reaches path-correct primary CTA within <=2 interactions.

## Path Definitions
- operator path: self-host-first user seeking deployment clarity and setup certainty.
- evaluator path: business decision user seeking product fit and adoption readiness.

## Page Spec: Home
### Purpose
- Establish what InvoiceNest does and who it is for.
- Present explicit path choice through hero cards.

### Audience Orientation
- Shared initial orientation for operator and evaluator.
- Path disambiguation occurs through hero card selection.

### Required Structure Contract
1. Value section
2. Path choice section (hero path cards)
3. Proof section
4. CTA section

### Next-Action Outcomes
- operator primary path outcome: Start Self-host Quickstart.
- evaluator primary path outcome: Create workspace.
- secondary fallback outcomes remain available after path selection.

### Continuity and Dead-End Rules
- Hero path cards must lead to path-correct CTA in <=2 interactions.
- Sticky CTA must update to the selected path state after hero selection.
- Home must never produce dead ends for operator or evaluator.

## Page Spec: Product
### Purpose
- Explain product scope, intent, and fit for evaluators while retaining operator continuity.

### Audience Orientation
- evaluator-primary framing with operator fallback action.

### Expected Next-Action Outcomes
- evaluator: Create workspace as primary route.
- operator: Start Self-host Quickstart via alternate route.

### Continuity and Dead-End Rules
- Product page must expose at least one clear action for operator and evaluator.
- Any secondary learn-more branch must resolve back to action states.
- Product page routing must ensure no dead ends.

### Flow Relationship
- Reinforces Value and Proof context and hands off to CTA contract.

## Page Spec: Self-host Quickstart
### Purpose
- Reduce setup ambiguity and provide actionable self-host entry for operator users.

### Audience Orientation
- operator-primary with evaluator fallback clarity.

### Expected Next-Action Outcomes
- operator: continue setup-oriented flow with concrete next step.
- evaluator: explicit fallback to workspace path without losing context.

### Continuity and Dead-End Rules
- Quickstart must maintain operator momentum without diversion loops.
- evaluator fallback must be visible and reversible.
- The page must guarantee no dead ends for either path.

### Flow Relationship
- Extends Proof for deployment clarity and hands off to CTA execution.

## Page Spec: Docs
### Purpose
- Provide implementation depth and confidence artifacts.

### Audience Orientation
- operator-primary for technical certainty; evaluator continuity preserved.

### Expected Next-Action Outcomes
- operator: clear path to Self-host Quickstart.
- evaluator: clear path to Product or Create workspace action.

### Continuity and Dead-End Rules
- Documentation browsing must not trap users in navigation loops.
- Both operator and evaluator actions must remain visible from docs context.
- Docs must maintain no dead ends.

### Flow Relationship
- Supports Proof stage and routes users toward CTA endpoints.

## Page Spec: Pricing/Licensing
### Purpose
- Clarify licensing expectations and reduce decision friction.

### Audience Orientation
- evaluator-primary with operator continuity requirement.

### Expected Next-Action Outcomes
- evaluator: Create workspace remains the primary next action.
- operator: Self-host Quickstart remains accessible as fallback.

### Continuity and Dead-End Rules
- Pricing/Licensing must always expose both path outcomes.
- Licensing details cannot terminate journey without CTA options.
- Pricing/Licensing must guarantee no dead ends.

### Flow Relationship
- Consolidates Value and Proof implications, then routes to CTA.

## Cross-Page Path Continuity Contract
### Operator continuity expectations
- Operator route intent remains setup-first across Home, Product fallback, Docs, and Pricing/Licensing.
- Operator primary action must remain Start Self-host Quickstart.
- Operator fallback action remains Create workspace.

### Evaluator continuity expectations
- evaluator route intent remains adoption-first across Home, Product, Pricing/Licensing, and Docs fallback.
- evaluator primary action must remain Create workspace.
- evaluator fallback action remains Self-host Quickstart.

## No-Dead-End Validation Clauses
Each mandatory page must satisfy all clauses:
- at least one primary or fallback CTA is visible for operator.
- at least one primary or fallback CTA is visible for evaluator.
- trust/proof context appears before forcing final CTA commitment.
- interaction paths resolve to known route targets, not orphan states.

## Requirement Traceability
### Traceability by Requirement
- DISC-01: Home page path cards and path definitions enforce explicit operator/evaluator routing.
- DISC-02: Home value-first requirement ensures users understand product intent before secondary sections.
- DISC-03: Proof-stage dependency and trust context clauses ensure trust signals are discoverable in discovery journey.
- DISC-04: Page-level next-action rules and no dead ends contract cover all mandatory landing pages.

### Traceability by Artifact Section
- Global discovery behavior rules: DISC-02, DISC-04.
- Page specs and expected outcomes: DISC-01, DISC-04.
- Cross-page continuity contract: DISC-01, DISC-04.
- No-dead-end validation clauses: DISC-04.

## Deferred Ideas and Out-of-Scope Items
Deferred Ideas for later phases (out of scope in Phase 9):
- A/B testing frameworks for path experiments.
- path-performance dashboards and deep growth analytics.
- New product capabilities outside discovery IA contracts.

## Handoff Notes
These page specs are intended inputs to:
- CTA path contract authoring
- trust and objection placement mapping
- acceptance matrix and scenario checklist generation
