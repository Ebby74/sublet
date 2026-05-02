# Phase 11: SSM Export Templates - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Create Excel export templates formatted for SSM (Companies Commission of Malaysia) submission. Produces Form 9 (Return of Allotment of Shares) and Form 44 (Statement of Affairs) compliant workbooks.

**Scope:**
- Form 9 and Form 44 support
- Multiple sheets matching SSM form sections
- Full data fields including company info and director signatures
- Dual export trigger (button + dropdown)
- Full validation with warnings

**Not in scope:**
- Loan documentation (Phase 12)

</domain>

<decisions>
## Implementation Decisions

### SSM Form Format (D-01)
- **Decision:** Both forms supported
- Form 9: Return of Allotment of Shares
- Form 44: Statement of Affairs for full financial disclosure

### Excel Structure (D-02)
- **Decision:** Multiple sheets + Both P&L and Balance Sheet
- Multiple sheets matching SSM form sections
- Both P&L and Balance Sheet data per SSM format

### Data Fields (D-03)
- **Decision:** Full fields
- Company name, registration number
- All financial items per SSM format
- Director signatures section

### Export Trigger (D-04)
- **Decision:** Both
- Separate "Export for SSM" button
- Option in existing export dropdown

### Validation (D-05)
- **Decision:** Full validation
- Check required fields present
- Confirm amounts balance
- Show warnings for issues

### OpenCode's Discretion
- Use existing XLSX patterns from export-service
- SSM templates stored as separate export format
- Default company name from config/project

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Financial Reports
- `src/components/reports/balance-sheet-report.tsx` — Balance Sheet data
- `src/components/reports/consolidated-pl-report.tsx` — P&L data
- `src/services/export-service.ts` — Existing Excel export patterns

### Database
- `prisma/schema.prisma` — Payment and Company models

### Previous Phase Contexts
- `.planning/phases/10-consolidated-financials/10-CONTEXT.md` — Consolidated financials

</canonical_refs>

<specifics>
## Specific Ideas

No external references requested. Standard SSM form layouts acceptable.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 11-ssm-export-templates*
*Context gathered: 2026-04-15*
