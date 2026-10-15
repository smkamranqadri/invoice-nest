# Phase 9 IA Sitemap Contract

## Purpose
Lock the discovery information architecture for Phase 9 so downstream phases can implement without ambiguity.

## Phase Boundary
- This document is blueprint-only.
- This phase is no capability expansion and must not add product features.
- The IA contract defines structure and routing intent only.

## Locked Discovery Navigation
Top-level discovery navigation stays lean with max 5 items:
1. Product
2. Self-host Quickstart
3. Docs
4. Pricing/Licensing
5. Sign in

Notes:
- Home is the default root entry surface, not a duplicate top-level nav label.
- Navigation is for discovery and conversion routing, not feature breadth expansion.

## Mandatory Sitemap Pages
The mandatory page set for this phase:
- Home
- Product
- Self-host Quickstart
- Docs
- Pricing/Licensing

## Route Map
| Route | Page | Primary Intent | Primary Audience Orientation | Next Action Requirement |
|---|---|---|---|---|
| `/` | Home | Establish value, trigger path selection, route to action | operator + evaluator | Must route to path-correct CTA without dead ends |
| `/product` | Product | Explain product scope and fit | evaluator-first with operator fallback | Must expose both path actions via primary or secondary mapping |
| `/self-host-quickstart` | Self-host Quickstart | Start setup-oriented journey | operator-first with evaluator fallback | Must keep setup path clear and reversible for evaluators |
| `/docs` | Docs | Provide proof-depth and implementation confidence | operator-first with evaluator continuity | Must provide clear next action for both paths |
| `/pricing` | Pricing/Licensing | Clarify licensing and decision readiness | evaluator-first with operator continuity | Must route to path-correct next action without dead ends |

## Homepage Entry Surfaces Used by Acceptance Matrix
Entry surfaces that must be validated in matrix/checklists:
- Home page load
- Hero path cards (Home)
- Sticky header CTA (Home after path selection)

## Entry Surface State Contract
### Home page load
- Presents shared discovery frame before path lock.
- Must communicate value before path choice.

### Hero path cards (Home)
- Presents exactly two path choices:
  - Self-host operator
  - Business evaluator
- Card choice sets path state used for immediate CTA routing.

### Sticky header CTA
- Visible in header during discovery flow.
- Follows selected hero path after hero selection.
- Must never point to an endpoint that creates dead ends.

## Homepage Flow Contract
The section order contract for Home is fixed:
1. Value
2. Path choice
3. Proof
4. CTA

This ordering is required to support trust-before-action outcomes.

## Service Intent by Page
- Home: orient user and force explicit path choice.
- Product: support evaluator understanding with operator continuity.
- Self-host Quickstart: reduce setup ambiguity and maintain conversion continuity.
- Docs: provide concrete proof depth and action continuity.
- Pricing/Licensing: reduce purchase/adoption uncertainty and keep both path actions available.

## Non-Expansion Guardrails
- No additional discovery personas beyond operator and evaluator.
- No new capabilities, billing systems, or product modules.
- No experimentation framework definitions in this phase.

## Requirement Traceability
### Traceability Matrix
- DISC-01: Two primary paths are discoverable from Home with explicit hero path cards.
- DISC-02: Home route contract ensures value communication appears before path or secondary interaction.
- DISC-03: Homepage flow lock and proof-stage positioning support trust signal discoverability.
- DISC-04: Mandatory route map requires next actions from every primary page with no dead ends.

### Artifact-to-Requirement Coverage
- Sitemap page set and entry-surface state contract: DISC-01, DISC-04.
- Homepage flow lock (Value -> Path choice -> Proof -> CTA): DISC-02, DISC-03.
- Route-level next action requirements: DISC-04.

## Deferred Ideas and Out-of-Scope Items
Deferred Ideas (out of scope for this phase):
- A/B testing for path or copy variants.
- Path-performance dashboards and growth experimentation analytics.
- Capability additions such as recurring billing or gateway expansion.

## Handoff Notes
This sitemap contract is the IA backbone for:
- section map construction
- CTA behavior contracts
- trust/objection placement mapping
- acceptance matrix coverage
