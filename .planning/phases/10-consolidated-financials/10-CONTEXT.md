# Phase 10: Consolidated Financials - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver consolidated financial reports combining all income sources into full company P&L and Balance Sheet. Shows total revenue, total expenses, net profit across Sublet + Autoren Sell + Autoren Rent.

**Scope:**
- Consolidated P&L (all income sources combined)
- Simple Balance Sheet (cash, receivables, equity)
- Period comparison (prior period)
- Dashboard summary widgets
- Export to PDF/Excel

**Not in scope:**
- SSM export templates (Phase 11)
- Loan documentation (Phase 12)

</domain>

<decisions>
## Implementation Decisions

### P&L Structure (D-01)
- **Decision:** Two sections with expandable breakdown
- Section 1: Income Summary (collapsible by source)
- Section 2: Expense Summary (collapsible by source)
- Net Profit at bottom
- Click to expand/collapse each section

### Balance Sheet Components (D-02)
- **Decision:** Simple structure for small agency
- Assets: Bank/Cash balance, Accounts Receivable
- Liabilities: Accounts Payable (if any)
- Equity: Opening balance + Net Profit - Drawings
- No complex asset depreciation

### Reporting Period (D-03)
- **Decision:** All options — Monthly, Quarterly, Yearly + custom range
- Preset buttons for quick selection
- "Compare to Prior Period" toggle shows YoY/QoQ change
- Custom date range picker

### Export Format (D-04)
- **Decision:** Both options
- PDF for printing/filing (single page summary)
- Excel with multiple sheets: P&L, Balance Sheet, Summary

### Visual Summary (D-05)
- **Decision:** Both — Key metrics cards + mini charts
- Dashboard cards: Total Revenue, Total Expenses, Net Profit, Profit Margin %
- Mini bar chart showing 6-month trend
- Click to full report

### OpenCode's Discretion
- Use existing card/chart patterns from Phase 09
- Balance Sheet auto-calculates from Payment data
- Empty state: "No transactions yet" with guidance

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Financial Reports
- `src/components/reports/profit-by-source-report.tsx` — Phase 09 profit report patterns
- `src/components/reports/business-summary-report.tsx` — Existing consolidated report
- `src/services/profit-report-service.ts` — Profit calculation logic

### Data Services
- `src/services/payment-service.ts` — Payment data access
- `src/services/export-service.ts` — Existing export patterns

### Database
- `prisma/schema.prisma` — Payment and Lease models

### Previous Phase Contexts
- `.planning/phases/08-expense-allocation/08-CONTEXT.md` — Expense allocation decisions
- `.planning/phases/09-per-source-profit-reports/09-CONTEXT.md` — Profit report decisions

</canonical_refs>

 код>
## Existing Code Insights

### Reusable Assets
- ProfitBySourceReport: Table/Cards/Charts pattern
- INCOME_SOURCES: Labels and colors
- Export service: Excel export functions
- Recharts: Already in use

### Established Patterns
- Report pages use useEffect for data fetching
- Filter state in component
- Export to Excel via API route

### Integration Points
- Dashboard: Add summary widget
- Reports: New "Consolidated" section
- Export: Add consolidated format

</code_context>

<specifics>
## Specific Ideas

No external references requested. Standard financial statement layouts acceptable.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-consolidated-financials*
*Context gathered: 2026-04-15*
