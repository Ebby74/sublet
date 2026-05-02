# Phase 09: Per-Source Profit Reports - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver P&L (Profit & Loss) reports broken down by income source (Sublet, Autoren Sell, Autoren Rent). Each source shows revenue - expenses = net profit, with visualizations and date filtering.

**Scope:**
- Revenue per income source
- Expenses per income source (from Phase 08)
- Net profit calculation per source
- Visual breakdown (bar, pie, trend)
- Date filtering (presets + custom range)
- Loss highlighting with warnings

**Not in scope:**
- Consolidated full company P&L (Phase 10)
- SSM export templates (Phase 11)
- Loan documentation (Phase 12)

</domain>

<decisions>
## Implementation Decisions

### Report Structure (D-01)
- **Decision:** Combined view with both table and cards
- Table shows: Revenue | Expenses | Profit columns per source
- Cards show: Each source's profit summary with margin %

### Time Period Selection (D-02)
- **Decision:** Both options available
- Preset dropdown: This Month, Last Month, This Quarter, Last Quarter, This Year, Last Year
- Custom date range picker for specific periods

### Visualization (D-03)
- **Decision:** All three chart types
- Bar chart: Compare profits across income sources
- Pie chart: Show profit distribution percentage
- Trend line: Profit over time (monthly/quarterly)

### Loss Handling (D-04)
- **Decision:** Red coloring + warning indicator
- Negative profit shown in red
- Warning badge/icon on loss items
- Alert banner at top when any source shows loss

### Summary Metrics (D-05)
- **Decision:** All metrics included
- Total revenue per source
- Total expenses per source
- Net profit (revenue - expenses)
- Profit margin percentage (profit/revenue × 100)
- Year-over-year comparison (when prior year data exists)

### OpenCode's Discretion
- Chart color palette: Use existing INCOME_SOURCES colors (blue/green/purple/gray)
- Table sorting: Default to highest profit first
- Empty state: Show "No data for this period" with suggestion to add transactions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Financial Reports
- `src/components/reports/business-summary-report.tsx` — Existing report patterns
- `src/components/reports/expense-allocation-report.tsx` — Phase 08 expense allocation (uses incomeSource)

### Data Services
- `src/services/payment-service.ts` — getPayments with incomeSource filter
- `src/lib/income-sources.ts` — INCOME_SOURCES constant with labels/colors

### Database
- `prisma/schema.prisma` — Payment model with incomeSource field

### Previous Phase Contexts
- `.planning/phases/08-expense-allocation/08-CONTEXT.md` — Expense allocation decisions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- INCOME_SOURCES constant: Labels and colors for all income sources
- Payment service: Already filters by incomeSource
- ExpenseAllocationReport: Similar structure for expense reports
- Recharts: Used in business-summary-report.tsx for PieChart

### Established Patterns
- Report components use useEffect for data fetching
- Summary cards with icons and colors
- Filter state managed in component
- API routes return data, components render

### Integration Points
- Reports navigation: `/reports` route
- Export service: Can add profit report export (similar to expense-allocation)
- Dashboard: Could add profit summary widget

</code_context>

<specifics>
## Specific Ideas

No external references requested. Standard approaches for financial reporting acceptable.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 09-per-source-profit-reports*
*Context gathered: 2026-04-15*
