---
phase: 18-profit-sharing-engine
plan: "02"
subsystem: Profit Sharing Reports API
tags: [jv-reports, api]
dependency_graph:
  requires: ["18-01"]
  provides: []
  affects: []
tech_stack:
  added: []
  patterns: [rest-api]
key_files:
  created:
    - src/app/api/v1/jv/reports/profit-sharing/route.ts
  modified: []
decisions: []
metrics:
  duration: ~2 min
completed: 2026-04-24
---

# Phase 18 Plan 02: Profit Sharing Reports API Summary

**One-liner:** REST API for JV profit sharing reports

## Must Haves Verification

| Truth | Status |
|-------|--------|
| JV stakeholders can access API | ✅ Auth + role check |
| Property-by-property breakdown | ✅ Returns properties array |
| JV share + owner share calculation | ✅ From service |
| Date range filtering | ✅ startDate/endDate params |
| Aggregated totals | ✅ totalRevenue, totalProfit, etc. |

## Artifacts Delivered

| Path | Description |
|------|-------------|
| `src/app/api/v1/jv/reports/profit-sharing/route.ts` | GET endpoint |

## API Endpoint

| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/api/v1/jv/reports/profit-sharing` | Profit sharing report |

### Query Params
- `startDate` (YYYY-MM-DD)
- `endDate` (YYYY-MM-DD)

### Response Format
```json
{
  "data": {
    "userId": "uuid",
    "dateRange": { "startDate": "", "endDate": "" },
    "properties": [...],
    "totalRevenue": 1500,
    "totalExpenses": 300,
    "totalProfit": 1200,
    "totalJvShare": 960,
    "totalOwnerShare": 240
  },
  "meta": { "total": N, "generatedAt": "ISO-8601" },
  "error": null
}
```

## Auth Pattern
- 401 if not authenticated
- 403 if role !== 'jv'
- Returns amounts in MYR (converted from sen)

## Deviations from Plan

None - plan executed as written.