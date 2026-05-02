# Phase 05: Malaysian Tax & Zakat - Context

**Gathered:** 2026-04-14
**Status:** Implemented (reviewed 2026-04-14)

<domain>
## Phase Boundary

Calculate and track Malaysian tax (LHDN progressive brackets) and Zakat (perniagaan) for financial compliance. Make rules flexible for future updates.

</domain>

<decisions>
## Implementation Decisions

### Tax Calculation
- **D-01:** LHDN progressive tax brackets (current 2024 rates)
- **D-02:** Tax is calculated on net profit (income - expenses)

### Zakat Calculation
- **D-03:** Zakat perniagaan at 2.5% of net profit
- **D-04:** Nisab threshold: RM 20,000 (profit must exceed this to be liable)
- **D-05:** Zakat calculated from net profit only (income - expenses)

### Tax-Zakat Relationship
- **D-06:** Zakat can offset tax liability (allowed under Malaysian law)
- **D-07:** Maximum offset = actual tax payable

### Flexibility (Critical!)
- **D-08:** Tax brackets stored in config/database, NOT hardcoded in code
- **D-09:** Auto-follow latest LHDN tax brackets and mosques' Zakat ruling (no admin manual update needed)
- **D-10:** System updates automatically when authoritative body releases new rates

### Reports
- **D-11:** P&L Statement with Zakat calculation
- **D-12:** Settings page with interactive Zakat & Tax calculator
- **D-13:** Excel exports include Zakat and Tax columns

</decisions>

<canonical_refs>
## Canonical References

### Project Context
- `.planning/PROJECT.md` — Malaysian market focus
- `.planning/ROADMAP.md` — Phase 5 goal

### No external specs — Malaysian tax/zakat rules change over time, captured in decisions above

</canonical_refs>

<codebase_context>
## Implementation Notes

### Flexible Tax/Zakat Approach
- Tax brackets: Store in `.planning/config.json` or database table
- Zakat rate: Configurable in settings (admin can update)
- Nisab threshold: Configurable in settings
- This allows updates without code changes

</codebase_context>

---

*Phase: 05-malaysian-tax-zakat*
*Context reviewed: 2026-04-14*