---
phase: 16-offer-viewing-system
plan: "02"
subsystem: Offer System
tags: [offer-submission, evaluation-engine]
dependency_graph:
  requires: ["16-01"]
  provides: []
  affects: []
tech_stack:
  added: []
  patterns: [rules-engine]
key_files:
  created:
    - src/services/offer-service.ts
    - src/app/api/v1/offers/route.ts
    - src/app/api/v1/offers/[id]/route.ts
    - src/app/api/v1/offers/[id]/accept/route.ts
    - src/app/api/v1/offers/[id]/reject/route.ts
  modified: []
decisions: []
metrics:
  duration: ~3 min
completed: 2026-04-24
---

# Phase 16 Plan 02: Offer System Summary

**One-liner:** Offer submission with AI evaluation rules engine

## Must Haves Verification

| Truth | Status |
|-------|--------|
| Offer model is ready | ✅ Already in schema from 16-01 |
| Create offer functionality | ✅ createOffer() |
| Evaluation rules engine | ✅ evaluateOffer() with thresholds |
| Accept/reject endpoints | ✅ Separate accept/reject routes |

## Artifacts Delivered

| Path | Description |
|------|-------------|
| `src/services/offer-service.ts` | CRUD + evaluation engine |
| `src/app/api/v1/offers/route.ts` | GET list, POST create |
| `src/app/api/v1/offers/[id]/route.ts` | GET single, PATCH evaluate |
| `src/app/api/v1/offers/[id]/accept/route.ts` | PATCH accept |
| `src/app/api/v1/offers/[id]/reject/route.ts` | PATCH reject |

## API Endpoints

| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/api/v1/offers` | List offers |
| POST | `/api/v1/offers` | Create offer |
| GET | `/api/v1/offers/[id]` | Get offer |
| PATCH | `/api/v1/offers/[id]` | Evaluate offer |
| PATCH | `/api/v1/offers/[id]/accept` | Accept offer |
| PATCH | `/api/v1/offers/[id]/reject` | Reject offer |

## Evaluation Rules

| Rule | Threshold | Decision |
|------|----------|----------|
| market_rate_match | >= asking rent | auto_accept |
| below_market | < 90% asking | auto_reject |
| negotiable | 90-99% | review |

## Deviations from Plan

None - plan executed as written.