# Phase 07: Business Breakdown & Analytics - Plan

**Date:** 2026-04-14
**Status:** Planned
**Goal:** Add comprehensive business breakdown summaries for Sublet property management

---

## Background

User runs a **sublet business** (managing other people's properties for commission). They need full visibility into their business performance across:
- Properties they manage
- Tenants in their properties
- Financial performance (income, expenses, profit)
- Cash flow forecasting

**Key constraints:**
- No property purchase prices (they don't own properties yet)
- Will add `purchasePrice` field later for ROI calculation
- For now: use rentAmountSen for property-level metrics
- Cash flow: show expected rent AND expected expenses

---

## Requirements Summary

### Dashboard Enhancements
1. **YTD Summary Cards** — Year-to-date income, expenses, net profit with YoY comparison
2. **Property Performance Cards** — Per-property breakdown with type grouping toggle
3. **Occupancy Trends Chart** — 12-month line chart showing occupancy rate
4. **Cash Flow Forecast Widget** — Next 3 months expected income + expenses

### Reports Page Additions
1. **Property Performance Report** — Detailed per-property analytics with Excel export
2. **Tenant Analytics Report** — Payment punctuality, lease status, revenue contribution
3. **Business Summary Report** — Full portfolio overview with key metrics

### Backend
1. **Business Summary Service** — Core analytics logic
2. **API Routes** — 4 new endpoints for dashboard/reports
3. **Excel Export** — Add new report types to existing export system

---

## Task Breakdown

### Part 1: Backend Services & APIs

#### Task 1.1: Create Business Summary Service
**File:** `src/services/business-summary-service.ts`

**Functions to implement:**
- getYtdStats(userId, year?) - YTD financials with YoY comparison
- getPropertyBreakdown(userId, groupByType?) - per property income/expense/profit
- getTenantAnalytics(userId, sortBy?) - payment history, punctuality, revenue
- getCashFlowForecast(userId, months?) - next N months expected income/expenses

#### Task 1.2: Create YTD Stats API Route
**File:** `src/app/api/v1/reports/ytd-stats/route.ts`
**Endpoint:** GET /api/v1/reports/ytd-stats

#### Task 1.3: Create Property Breakdown API Route
**File:** `src/app/api/v1/reports/property-breakdown/route.ts`
**Endpoint:** GET /api/v1/reports/property-breakdown

#### Task 1.4: Create Tenant Analytics API Route
**File:** `src/app/api/v1/reports/tenant-analytics/route.ts`
**Endpoint:** GET /api/v1/reports/tenant-analytics

#### Task 1.5: Create Cash Flow Forecast API Route
**File:** `src/app/api/v1/reports/cash-flow-forecast/route.ts`
**Endpoint:** GET /api/v1/reports/cash-flow-forecast

---

### Part 2: Dashboard Enhancements

#### Task 2.1: Add YTD Summary Cards
**File:** `src/app/(dashboard)/page.tsx` (modify)
- New row above existing stats
- 3 cards: YTD Income, YTD Expenses, YTD Net Profit
- Show YoY percentage change

#### Task 2.2: Add Property Performance Section
**File:** `src/components/dashboard/property-performance.tsx` (new)
- Expandable/collapsible
- Toggle: By Property vs By Type
- Show: Name, Income, Expenses, Net Profit, Status

#### Task 2.3: Add Occupancy Trends Chart
**File:** `src/components/dashboard/occupancy-trends-chart.tsx` (new)
- 12-month line chart
- Current year vs Previous year lines

#### Task 2.4: Add Cash Flow Forecast Widget
**File:** `src/components/dashboard/cash-flow-forecast.tsx` (new)
- Next 3 months
- Expected Income / Expected Expenses / Net Cash Flow

---

### Part 3: Reports Page Additions

#### Task 3.1: Add Property Performance Report
**File:** `src/components/reports/property-performance-report.tsx` (new)
- Period selector
- Table with sortable columns
- Group by type toggle
- Export to Excel

#### Task 3.2: Add Tenant Analytics Report
**File:** `src/components/reports/tenant-analytics-report.tsx` (new)
- Sort by: Revenue, Name, Expiry, Punctuality
- Punctuality as colored progress bar
- Export to Excel

#### Task 3.3: Add Business Summary Report
**File:** `src/components/reports/business-summary-report.tsx` (new)
- Portfolio Overview (properties, rooms, occupancy)
- Financial Summary (YTD)
- Key Metrics (collection rate, avg rent, vacancy)
- Cash Flow Forecast (mini chart)
- Export options

#### Task 3.4: Update Reports Page
**File:** `src/app/reports/page.tsx` (modify)
- Add "Business Analytics" section with new reports

---

### Part 4: Excel Export Support

#### Task 4.1: Add New Export Types
**File:** `src/services/export-service.ts` (modify)
- Add: property-performance, tenant-analytics, business-summary

---

## Files Summary

| File | Action |
|------|--------|
| `src/services/business-summary-service.ts` | CREATE |
| `src/app/api/v1/reports/ytd-stats/route.ts` | CREATE |
| `src/app/api/v1/reports/property-breakdown/route.ts` | CREATE |
| `src/app/api/v1/reports/tenant-analytics/route.ts` | CREATE |
| `src/app/api/v1/reports/cash-flow-forecast/route.ts` | CREATE |
| `src/components/dashboard/property-performance.tsx` | CREATE |
| `src/components/dashboard/occupancy-trends-chart.tsx` | CREATE |
| `src/components/dashboard/cash-flow-forecast.tsx` | CREATE |
| `src/components/reports/property-performance-report.tsx` | CREATE |
| `src/components/reports/tenant-analytics-report.tsx` | CREATE |
| `src/components/reports/business-summary-report.tsx` | CREATE |
| `src/app/(dashboard)/page.tsx` | MODIFY |
| `src/app/reports/page.tsx` | MODIFY |
| `src/services/export-service.ts` | MODIFY |

**Total:** 16 tasks

---

## Execution Order

1. Tasks 1.1-1.5: Backend (Business Summary Service + 4 API routes)
2. Tasks 2.1-2.4: Dashboard components
3. Tasks 3.1-3.4: Reports components + page update
4. Task 4.1: Excel export support + verification

---

## Verification Checklist

- [ ] YTD stats show correct totals with YoY comparison
- [ ] Property breakdown matches individual property sums
- [ ] Tenant punctuality calculated correctly
- [ ] Cash flow forecast matches active lease totals
- [ ] All Excel exports download correctly
- [ ] Dashboard loads without errors
- [ ] Reports page displays all new sections
- [ ] Mobile responsive
- [ ] Loading and empty states shown

