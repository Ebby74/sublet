# Phase 2: Property & Tenant Management - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning (updated from discussion)

<domain>
## Phase Boundary

Enable users to manage properties, rooms, tenants, and lease agreements with full CRUD operations, occupancy tracking, and comprehensive lease termination workflow.

**UPDATED from Phase 01 decisions:**
- Property has multiple rooms (not single unit)
- Shariah compliance: Muslimah only OR Muslim only (no mixed)
- AI photo scanning to auto-detect room items
- Full automation for prospect engagement
- Blacklist system for bad tenants

Deliverables:
- Property management with room system
- Room management (photos, status, pricing, AI-detected items)
- Tenant management with IC + document upload + social links
- Shariah-compliant properties (single gender only)
- Blacklist system
- Lease creation wizard and lifecycle management
- Termination workflow with checklist

</domain>

<decisions>
## Implementation Decisions

### Property Model
- **D-01:** Property can have multiple rooms
- **D-02:** Property has Shariah compliance: "Muslimah only" OR "Muslim only" — NO mixed gender
- **D-03:** Property has hero photo (AI-selected to entice prospects)
- **D-04:** Property shows price range "From RMxxx" on public page
- **D-05:** Property shows nearby amenities and transport info

### Room Model
- **D-06:** Each room belongs to a property
- **D-07:** Room has photos gallery (uploaded by landlord, AI scans to detect items)
- **D-08:** Room status: Vacant / Occupied (toggle)
- **D-09:** Room has monthly rent price (shown after prospect registers)
- **D-10:** Room has bed type: Single bed only (no double decker)
- **D-11:** Room can be: Single room OR Sharing room (max 2 tenants)
- **D-12:** AI photo scanning detects: wardrobe, ceiling fan, wall fan, living room items, CCTV, kitchen, refrigerator, washing machine

### Room Assignment
- **D-13:** Tenant can pick specific room (option A)
- **D-14:** Landlord can assign room (option B)
- **D-15:** Tenant can upgrade/change later (option C)

### Property List Layout (Landlord)
- **D-16:** Hybrid layout — cards on mobile, table on desktop
- **D-17:** Responsive breakpoint at 'lg' (1024px) for layout switch
- **D-18:** Property cards show: name, address, status badge (color-coded), price range

### Property Forms
- **D-19:** Progressive forms — essential fields first, expandable "More details" section
- **D-20:** Essential fields: name, address, type, gender restriction (Muslimah only / Muslim only)
- **D-21:** Property statuses: Vacant, Occupied, Maintenance, Under Renovation

### Tenant Management
- **D-22:** Tenant form with required fields: name, phone, IC number
- **D-23:** IC document upload required — front and back image/PDF of IC (LHDN compliance)
- **D-24:** Optional fields (in "More details"): email, Facebook link, Instagram link, TikTok link
- **D-25:** Each tenant has their own tenancy agreement (even in sharing room)

### Blacklist System
- **D-26:** Store: Name, phone, email, IC number, last location, blacklisted by (name + number), reason, date
- **D-27:** Auto-scan any new prospect against blacklist before processing
- **D-28:** Landlord can manually add bad tenants
- **D-29:** Can import from FB groups, fellow subletters

### Prospect Interest
- **D-30:** Handled by AI Chatbot (Phase 01) — fully automated
- **D-31:** Bot captures contact when prospect clicks "I'm Interested"
- **D-32:** Bot qualifies leads, schedules viewings, gets deposits
- **D-33:** Contact verification via WhatsApp test message

### Damage Reporting
- **D-34:** Tenant can report damages anytime during tenancy
- **D-35:** Can upload photos and videos
- **D-36:** Report categories: room, house, appliances

### Lease Creation Flow
- **D-37:** Step-by-step wizard (4 steps):
  1. Select property (show vacant rooms)
  2. Select or create tenant
  3. Set dates, rent amount, deposit
  4. Review & confirm
- **D-38:** Deposit stored separately, never set-off with final rent

### Occupancy/Lease Status Display
- **D-39:** Property cards show color-coded status badge:
  - Green: Occupied
  - Yellow: Vacant
  - Red: Maintenance / Under Renovation
- **D-40:** Room-level status: Vacant / Occupied (separate from property status)
- **D-41:** Auto-update lease status to "expired" when end date passes

### Termination Workflow
- **D-42:** 2 months before expiry: Bot WhatsApp tenant "Continue or let expire?"
- **D-43:** 1 month before expiry: Bot WhatsApp owner with tenant response
- **D-44:** Termination checklist (all must be verified):
  - Rooms checked
  - Everything cleaned
  - All damages repaired
  - All rentals paid
  - All bills paid
  - All trash removed
  - Personal belongings removed
- **D-45:** Deposit refund via owner buttons: "Full refund" or "Partial (with reason)"

### Delete Behavior
- **D-46:** Soft delete for all entities (Property, Room, Tenant, Lease)
- **D-47:** Deleted items hidden from UI but preserved in database

### Dashboard Integration
- **D-48:** Real-time property count
- **D-49:** Real-time tenant count
- **D-50:** Occupancy rate (vacant rooms / total rooms)
- **D-51:** Monthly income from active leases

### Compliance (Malaysian Law)
- **D-52:** Must show price range on public page (government requirement)
- **D-53:** IC collection for LHDN compliance
- **D-54:** Shariah compliance: single gender only (no mixed)
- **D-55:** Tenancy agreements must be proper legal format

### OpenCode's Discretion
The following are left to OpenCode:
- Table column configuration and sorting
- Form validation messages and patterns
- Empty state illustrations and copy
- Responsive breakpoint fine-tuning
- Exact component styling details (use Orange theme from Phase 01)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 Context (MUST READ)
- `.planning/phases/01-foundation-infrastructure/01-CONTEXT.md` — Design (Orange theme), Public pages, AI Chatbot, Lead qualification
- `.planning/phases/01-foundation-infrastructure/01-CONTEXT.md` — Shariah options, Price display, WhatsApp verification

### Project Context
- `.planning/PROJECT.md` — Core value, target users (Malaysian landlords)
- `.planning/REQUIREMENTS.md` — Phase 2 requirements

### Stack & Conventions
- `.planning/codebase/STACK.md` — Technology stack (Next.js 16, Prisma, Tailwind CSS 4)
- `.planning/codebase/CONVENTIONS.md` — Component patterns, naming conventions

### Database
- `prisma/schema.prisma` — Existing schema (to be updated for rooms)

</canonical_refs>

 {#code_context}
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx` — Button with variants
- `src/components/ui/sheet.tsx` — Mobile slide-out
- `src/components/layout/sidebar.tsx` — Already links to Properties, Tenants
- `src/lib/format.ts` — MYR currency formatting

### Established Patterns
- Tailwind CSS 4 with CSS-first syntax
- shadcn/ui component structure
- Progressive disclosure for forms
- Card-based UI for property/room display

### Integration Points
- New routes: `/properties`, `/properties/[id]`, `/properties/[id]/rooms`
- New routes: `/tenants`, `/tenants/new`, `/tenants/[id]`
- New routes: `/leases`, `/leases/new`, `/leases/[id]`
- Bot integration: `/api/chatbot/*` for prospect engagement
- Blacklist: `/api/blacklist/*` for tenant screening

### Malaysian Compliance
- IC number required for tenants (LHDN)
- IC document upload (front/back) required
- MYR currency (sen integer storage)
- Shariah compliance (single gender only)
- Price display requirements

</code_context>

<specifics>
## Specific Ideas

### Design (Phase 01)
- "White + Bright Orange (like the fruit)" — AMR Home Solutions inspired
- Use Orange for primary buttons, CTAs, price highlights

### Public Property Page
- AI-selected hero photo to entice
- Shariah label visible: "Muslimah only" OR "Muslim only"
- Price range "From RMxxx"
- Room cards with status badges

### Landlord Dashboard
- Full sidebar navigation
- Properties with room counts
- Tenants with lease status

### Tenant Form
- IC number required (LHDN)
- Document upload required
- Social links optional

### AI Photo Scanning
- When landlord uploads photos, AI auto-detects:
  - Wardrobe (yes/no)
  - Ceiling fan (yes/no)
  - Wall fan (yes/no)
  - Living room (sofa, TV, WiFi)
  - CCTV (yes/no)
  - Kitchen (can cook)
  - Refrigerator (yes/no)
  - Washing machine (yes/no)

</specifics>

<deferred>
## Deferred Ideas

### For Phase 04 (Notifications)
- WhatsApp integration for lease expiry reminders
- WhatsApp for rent/bills due reminders

### For Phase 06/07 (AI Chatbot)
- Lead qualification logic (already in Phase 01 context)
- Lie detection patterns
- Room recommendation logic

### For Later
- Any changes to termination workflow after go live

</deferred>

---

*Phase: 02-property-tenant-management*
*Context gathered: 2026-04-13*
*Updated from discussion*