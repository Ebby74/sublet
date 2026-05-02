# Phase 2: Property & Tenant Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 02-property-tenant-management
**Areas discussed:** Room Model, Room Features, Tenant Form, Blacklist System, Prospect Interest, Termination Workflow, UI/Design, Shariah Compliance, Price Display, Contact Verification

---

## Room Model (NEW from Phase 01 update)

| Option | Description | Selected |
|--------|-------------|----------|
| Single property = single unit | Old model | |
| Multiple rooms per property | New model | ✓ |
| Each room: photos, status, price | | ✓ |
| Single bed only (no double decker) | | ✓ |
| 2 tenants max per room | | ✓ |
| Each tenant has own agreement | Even in sharing room | ✓ |

**User's choice:** Multiple rooms per property, single bed, max 2 per room, each with own agreement

---

## Room Assignment

| Option | Description | Selected |
|--------|-------------|----------|
| A | Tenant picks specific room | ✓ |
| B | Landlord assigns room | ✓ |
| C | Can upgrade/change later | ✓ |

**User's choice:** All 3 options available

---

## AI Photo Scanning

| Item | Detected |
|------|----------|
| Wardrobe | Yes/No |
| Ceiling fan | Yes/No |
| Wall fan | Yes/No |
| Living room (sofa, TV, WiFi) | Yes/No |
| CCTV | Yes/No |
| Kitchen (can cook) | Yes/No |
| Refrigerator | Yes/No |
| Washing machine | Yes/No |

**User's choice:** AI scans uploaded photos and auto-detects all items

---

## Tenant Form

| Field | Status |
|-------|--------|
| Name | Required |
| Phone | Required |
| IC Number | Required (LHDN) |
| IC Document (front) | Required |
| IC Document (back) | Required |
| Email | Optional |
| Facebook link | Optional |
| Instagram link | Optional |
| TikTok link | Optional |

**User's choice:** All required + social links as optional

---

## Blacklist System

| Feature | Description |
|---------|-------------|
| Store | Name, phone, email, IC, last location, blacklisted by (name+number), reason, date |
| Auto-scan | Check prospect against blacklist |
| Manual add | Landlord adds bad tenants |
| Import | From FB groups, fellow subletters |

**User's choice:** All features — will provide blacklist data as encountered

---

## Prospect Interest (Handled by AI Chatbot)

Fully automated — bot captures contact, qualifies leads, schedules viewings, gets deposits.
Landlord only involved when prospect wants to book viewing.

---

## Contact Verification

| Option | Description | Selected |
|--------|-------------|----------|
| OTP (SMS) | Send code via SMS | |
| WhatsApp test | Send test WhatsApp message | ✓ |

**User's choice:** WhatsApp test — verify valid number before processing

---

## Termination Workflow

| Timing | Action |
|--------|--------|
| 2 months before | Bot WhatsApp tenant: "Continue or let expire?" |
| 1 month before | Bot WhatsApp owner with response |
| End of lease | Termination checklist |
| After check-out | Deposit refund decision |

**User's choice:** Keep same flow — will update if changes after go live

---

## Shariah Compliance

| Option | Description | Selected |
|--------|-------------|----------|
| Mixed | Anyone (standard) | |
| Muslimah only | Women only | ✓ |
| Muslim only | Men only | ✓ |
| No mixed gender | Per Malaysian Shariah law | ✓ |

**User's choice:** NO mixed option — must be Muslimah only OR Muslim only

---

## Price Display

| Option | Description | Selected |
|--------|-------------|----------|
| Show exact price upfront | | |
| Hide until register | | |
| Show range "From RMxxx" | Price range on public, exact after login | ✓ |

**User's choice:** Show price range "From RMxxx" on public page (government requirement), exact price after prospect registers contact

---

## Hero Photo

**User's choice:** AI selects best photo to entice prospects to click and learn more

---

## Room Recommendation (AI Chatbot - Phase 01 already added)

**User's choice:** Prioritize 2 tenants renting together for sharing rooms. Avoid single tenant in sharing room (push to single room). Reason: Single tenant makes vacant bed less attractive to strangers.

---

## Property List Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Cards | Visual property cards showing name, address, status badge, rent | |
| Table | Dense list view with sortable columns | |
| Hybrid | Cards on mobile, table on desktop | ✓ |

**User's choice:** Hybrid
**Notes:** Cards on mobile, table on desktop — responsive and practical

---

## Property/Tenant Forms

| Option | Description | Selected |
|--------|-------------|----------|
| Progressive (Recommended) | Essential fields first, expandable 'More details' section | ✓ |
| Minimal | Only required fields | |
| Comprehensive | All fields visible upfront | |

**User's choice:** Progressive
**Notes:** Essential fields first, expandable section for optional info

---

## Property Types

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed list | Preset options: Apartment, Condo, House, Room, Commercial | |
| Flexible | Users can type any property type | ✓ |

**User's choice:** Flexible
**Notes:** More flexibility for users

---

## Tenant IC Number

| Option | Description | Selected |
|--------|-------------|----------|
| Optional | IC number field available but not required | |
| Required | IC number required for all tenants | ✓ |
| Required + Document | IC number required + upload front/back image/PDF | ✓ |

**User's choice:** Required with document upload
**Notes:** IC number required for all tenants with LHDN compliance; front and back IC image/PDF required

---

## IC Document Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Local filesystem (Recommended) | Store in /public/uploads/ | ✓ |
| Database (base64) | Store as base64 in database | |
| Cloud storage (future) | Design schema for cloud storage | |

**User's choice:** Local filesystem
**Notes:** /public/uploads/tenants/{tenant_id}/

---

## Lease Creation Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Step-by-step wizard (Recommended) | Guided 4-step flow: property, tenant, dates, review | ✓ |
| Inline form | Single form with all fields | |
| Quick-assign modal | Minimal modal for fast lease creation | |

**User's choice:** Step-by-step wizard
**Notes:** Guided flow reduces errors

---

## Occupancy/Lease Status Display

| Option | Description | Selected |
|--------|-------------|----------|
| Badges + Timeline (Recommended) | Status badges on cards + lease timeline on detail | ✓ |
| Status badges only | Simple color-coded badges | |
| Timeline only | Visual timeline on property detail page | |

**User's choice:** Badges + Timeline
**Notes:** Comprehensive status visibility

---

## Property Statuses

| Option | Description | Selected |
|--------|-------------|----------|
| 3 statuses | Vacant, Occupied, Maintenance | |
| 5 statuses | Vacant, Occupied, Maintenance, Under Renovation, Listed for Sale | ✓ |
| Customizable | Users can add/remove statuses | |

**User's choice:** 5 statuses
**Notes:** Vacant, Occupied, Maintenance, Under Renovation, Listed for Sale

---

## Delete Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Soft delete (Recommended) | Mark as deleted, never remove from database | ✓ |
| Hard delete | Permanently remove | |

**User's choice:** Soft delete
**Notes:** Keeps audit trail and allows recovery

---

## Dashboard Integration

| Option | Description | Selected |
|--------|-------------|----------|
| Real-time counts (Recommended) | Property/tenant counts from database | ✓ |
| Placeholder for now | Keep placeholder stats | |

**User's choice:** Real-time counts
**Notes:** Property/tenant counts pulled live from database

---

## Lease Termination Workflow

**User provided comprehensive requirements:**

- 2 months before expiry: WhatsApp to tenant asking if they want to continue
- 1 month before expiry: Prompt owner to decide
- Tenant page has "Continue Renting" and "Let Contract Expires" buttons
- Contract expires on last day of month
- Termination checklist: rooms checked, cleaned, damages repaired, rentals/bills paid, trash removed, belongings removed
- Deposit refund: full refund if all verified, or partial with deductions

**Notes:** This is a detailed lease termination workflow. Implementation needs careful planning.

---

## WhatsApp Notifications

| Option | Description | Selected |
|--------|-------------|----------|
| Design for Phase 4 | Include workflow/UI in Phase 2, sending in Phase 4 | ✓ |
| Phase 2 now | Include WhatsApp integration in Phase 2 | |

**User's choice:** Design for Phase 4
**Notes:** WhatsApp integration deferred to Phase 4 (Notifications & Polish)

**Additional requirement:** WhatsApp messages for:
- Rent due reminders
- Bills due reminders
- Lease expiry reminders

---

## OpenCode's Discretion

Areas where user deferred to OpenCode:
- Table column configuration and sorting
- Form validation messages and patterns
- Empty state illustrations and copy
- Responsive breakpoint fine-tuning
- Exact component styling details

---

## Deferred Ideas

**For Phase 4 (Notifications & Polish):**
- WhatsApp integration for lease expiry reminders
- WhatsApp for rent/bills due reminders
- Email notifications as alternative
- In-app notification center

---

## Deferred from This Discussion

- Changes to termination workflow after go live (user will inform)
- Blacklist data to be provided as encountered

---

*Last updated: 2026-04-13*
