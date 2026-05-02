---
phase: 18-profit-sharing-engine
plan: "01"
subsystem: Profit Calculation
tags: [profit-calculation, jv-split]
dependency_graph:
  requires: []
  provides: ["18-02"]
  affects: []
tech_stack:
  added: []
  patterns: [profit-calculation]
key_files:
  created:
    - src/services/profit-sharing-service.ts
  modified:
    - prisma/schema.prisma
decisions: []
metrics:
  duration: ~3 min
completed: 2026-04-24
---

# Phase 18 Plan 01: Profit Calculation Service Summary

**One-liner:** Profit calculation service with JV split configuration

## Must Haves Verification

| Truth | Status |
|-------|--------|
| Property model has jvSplit field | ✅ Already in schema |
| Revenue aggregation by property | ✅ getPropertyRevenue() |
| Expense aggregation by property | ✅ getPropertyExpenses() |
| Net profit = revenue - expenses | ✅ In getProfitSharingReport |
| JV share calculation from jvSplit | ✅ Owner/JV split logic |

## Artifacts Delivered

| Path | Description |
|------|-------------|
| `prisma/schema.prisma` | jvSplit Float? field |
| `src/services/profit-sharing-service.ts` | getProfitSharingReport with types |

## Service Interfaces

```typescript
interface PropertyProfit {
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  jvStakeholderId: string | null;
  jvSplit: number | null;
  revenueSen: number;
  expensesSen: number;
  netProfitSen: number;
  jvShareSen: number | null;
  ownerShareSen: number | null;
}

interface ProfitSharingReport {
  userId: string;
  dateRange: { startDate: string; endDate: string };
  properties: PropertyProfit[];
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalJvShare: number;
  totalOwnerShare: number;
}
```

## Profit Calculation Logic

- Fetches properties where user is owner OR jvStakeholderId matches
- Aggregates income/expenses through lease -> property
- netProfit = revenue - expenses
- If jvSplit: jvShare = netProfit * jvSplit, ownerShare = netProfit - jvShare

## Deviations from Plan

None - plan executed as written.