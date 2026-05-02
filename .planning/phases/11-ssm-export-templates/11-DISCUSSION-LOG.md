# Phase 11: SSM Export Templates - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-15
**Phase:** 11-ssm-export-templates
**Areas discussed:** SSM Form Format, Excel Structure, Data Fields, Export Trigger, Validation

---

## SSM Form Format

| Option | Description | Selected |
|--------|-------------|----------|
| Form 9 only | Return of Allotment of Shares | |
| Form 44 only | Statement of Affairs | |
| **Both** | Full compliance for SSM submission | ✓ |

**User's choice:** 3. both

---

## Excel Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single sheet | All data on one sheet | |
| Multiple sheets | Match SSM form sections | |
| **Both** | P&L + Balance Sheet per SSM format | ✓ |

**User's choice:** 3. both

---

## Data Fields

| Option | Description | Selected |
|--------|-------------|----------|
| Basic only | Company name, registration number | |
| Financial items | All financial items per SSM format | |
| **Full** | Above + Director signatures section | ✓ |

**User's choice:** 3. full

---

## Export Trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Separate button | "Export for SSM" button | |
| Dropdown option | Option in existing export dropdown | |
| **Both** | Separate button + dropdown option | ✓ |

**User's choice:** 3. both

---

## Validation

| Option | Description | Selected |
|--------|-------------|----------|
| Basic check | Check required fields present | |
| Balance check | Confirm amounts balance | |
| **Full validation** | Above + show warnings | ✓ |

**User's choice:** 3. full validation

---

## OpenCode's Discretion

- Use existing XLSX patterns from export-service
- SSM templates stored as separate export format
- Default company name from config/project

---

## Deferred Ideas

None — discussion stayed within phase scope.
