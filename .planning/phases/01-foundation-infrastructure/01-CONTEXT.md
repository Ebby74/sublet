# Phase 1: Foundation & Infrastructure - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning (updated from discussion)

<domain>
## Phase Boundary

Establish project scaffold with Next.js 16, Prisma + SQLite, authentication, and base layout. This sets up the foundation that all subsequent phases depend on.

**UPDATED VISION:**
- Public web app — anyone can view properties and rooms
- Tenant portal — auth required after deposit + signed lease
- Landlord admin — full management dashboard

Deliverables:
- Next.js 16 project with TypeScript and App Router
- Prisma ORM with SQLite and database schema
- Dual auth: Public (no login) + Protected (tenant/landlord)
- MYR currency utilities (sen integer storage)
- Tailwind CSS 4 with custom orange theme
- Base layout with dual navigation (simplified public, full sidebar for admin)

</domain>

<decisions>
## Implementation Decisions

### Platform
- **D-01:** Web application (not mobile app)
- **D-02:** Mobile-responsive — works on phone and desktop

### Auth Model
- **D-03:** Public pages — NO auth required, anyone can view properties/rooms
- **D-04:** Tenant login — Auth required AFTER paying deposit AND signing lease
- **D-05:** Tenant portal features: Pay rent, view lease, download receipts, e-sign tenancy agreement, **report damages (with photos/videos)**
- **D-06:** E-sign delivery — Both landlord and tenant receive copy via WhatsApp AND email
- **D-07:** Landlord login — Full admin access to dashboard, properties, tenants, payments

### Navigation Structure
- **D-08:** Public navigation — Simplified: search bar + WhatsApp contact CTA only
- **D-09:** Landlord navigation — Full sidebar: Dashboard, Properties, Tenants, Payments, Reports, Settings
- **D-10:** Hybrid: sidebar on desktop (lg+), hamburger menu on mobile

### Visual Design
- **D-11:** Clean minimalist aesthetic — white background
- **D-12:** Color scheme — White + Bright Orange (AMR Home Solutions inspired)
- **D-13:** Orange for primary buttons, CTAs, highlights

### Property Page (Public)
- **D-14:** Top section: Property name, address, location map, hero photo (AI-selected to entice)
- **D-14a:** Shariah compliance: MUST be either "Muslimah only" OR "Muslim only" (NO mixed gender) — displayed on property and room details
- **D-15:** Amenities section: Nearby amenities with distances
- **D-16:** Transport section: Public transport (LRT/bus) with walking times
- **D-17:** Room grid: Each room as card with photo, status (vacant/occupied), price range ("From RMxxx"), "I'm interested" CTA
- **D-17a:** Price: Show price range "From RMxxx" on public page (government requirement) — exact price shown after prospect registers contact details
- **D-17b:** Contact verification: WhatsApp test message to verify valid number before processing inquiry

### Room Model (Deferred to Phase 02)
- **D-18:** Property can have multiple rooms
- **D-19:** Each room has: photos gallery, status checkbox (vacant/occupied), price, features

### Marketing Automation (Deferred to Phase 06)
- **D-20:** Auto-post vacant rooms to: Facebook, Instagram, Telegram, X (Twitter), Threads, LinkedIn, Lemon8, **Ohmyhome**
- **D-21:** Post trigger: When tenant confirms NOT renewing → start marketing BEFORE contract ends
- **D-22:** Posting frequency: Twice daily at peak times (AI-determined)
- **D-23:** AI photo enhancement: Beautify photos (brightness, contrast) WITHOUT changing room layout or furniture
- **D-24:** Predictive targeting: Find where potential tenants are active, track engagement, optimize posting

### AI Chatbot (Deferred to Phase 06/07)
- **D-25:** Fully automated AI chatbot engages all prospects 24/7
- **D-26:** Bot answers all questions: price, location, amenities, availability, comparisons
- **D-27:** Bot qualifies leads and schedules viewing appointments
- **D-28:** Human handoff: Landlord only involved when prospect wants to book viewing
- **D-29:** Landlord input: Only add photos/videos and property details — bot does everything else
- **D-30:** Channels: Website chat, WhatsApp integration
- **D-31:** Lead qualification: Filter "urgent" prospects — good urgency (new job, duty) vs bad urgency (kicked out, breach contract)
- **D-32:** Lie detection: Analyze conversation patterns, inconsistent answers, unusual contact hours (late night/early morning = red flag)
- **D-33:** Red flag: "I have money now" + late night contact = scam/problem tenant risk

### Blacklist System (Deferred to Phase 02 - Tenant Management)
- Store: Name, phone, email, IC number, last location, blacklisted by (name + number), reason, date
- AI check: Auto-scan prospect against blacklist on inquiry
- Import: From FB groups, fellow subletters, manual input

### OpenCode's Discretion
The following technical decisions are left to OpenCode:
- Exact implementation of public vs protected route separation
- E-signature library/approach
- WhatsApp integration approach for document delivery
- Email service integration

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value proposition, target users (small Malaysian landlords)
- `.planning/REQUIREMENTS.md` — Foundation requirements (FOUND-01 through FOUND-08)
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria

### Stack Decisions
- `.planning/codebase/STACK.md` — Technology stack (Next.js 16, Prisma, Tailwind CSS 4)
- `.planning/research/STACK.md` — Detailed stack research with versions and rationale

### Design System
- `.planning/research/FEATURES.md` — Visual design references

### Malaysian Compliance
- `.planning/research/PITFALLS.md` — Currency precision pitfalls (use sen integers)

### Conventions
- `.planning/codebase/CONVENTIONS.md` — TypeScript conventions, naming, component patterns
- `.planning/codebase/ARCHITECTURE.md` — File organization, API patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Current Implementation
- Phase 01 already implemented with Next.js 16, Prisma, Tailwind 4
- Basic auth (email/password) exists
- Basic layout (sidebar + mobile menu) exists

### Reusable Assets
- Next.js 16 app structure — keep and adapt
- Prisma schema with 5 models — update for rooms
- Authentication utilities — adapt for dual-auth model
- Layout components — adapt for public vs admin versions

### Integration Points
- Public routes: `/` (property listing), `/property/[id]` (details)
- Auth routes: `/login`, `/register`, `/tenant-portal`, `/dashboard`
- WhatsApp: Already integrated for marketing — reuse for document delivery

</code_context>

<specifics>
## Specific Ideas

### Design
- "White + Bright Orange (like the fruit)" — AMR Home Solutions inspired
- Clean, modern, inviting — warm colors for trust

### Public Property Page
- Hero section with AI-selected photo to entice clicks
- "Enticement badges" — Near LRT, Near Mall, University Area
- Shariah compliance visible: "Muslimah only" OR "Muslim only" (no mixed)
- Price range shown: "From RMxxx"
- Room cards with photos, status, price range, "I'm Interested" button
- Quick contact via WhatsApp

### Price & Verification
- Public page: Show price range "From RMxxx" (malaysian law requirement)
- After contact registered: Show exact price per room
- Contact verification: WhatsApp test message to confirm real number

### Tenant Form (Phase 02)
- IC number required (LHDN compliance)
- IC document upload required (front + back)
- Name, phone, email
- Social media links (optional): Facebook, Instagram, TikTok
- Progressive form: essential first, optional in expandable section

### Marketing Automation
- Auto-post to: Facebook, Instagram, Telegram, X, Threads, LinkedIn, Lemon8, **Ohmyhome**
- Start posting when tenant confirms not renewing
- Post twice daily at peak times
- AI photo enhancement (beautify without changing layout)
- Predictive targeting of potential tenants

### AI Chatbot (Automation)
- Fully automated — landlord only adds photos/videos + details
- Bot answers ALL prospect questions 24/7
- Qualify leads, schedule viewings
- Landlord involvement ONLY when prospect wants to book viewing
- Channels: Website chat, WhatsApp

### Lead Qualification & Lie Detection
- Filter "urgent" prospects: Good urgency (new job, urgent duty) vs Bad urgency (kicked out, breach contract)
- Late night/early morning contact = red flag
- "I have money now" + unusual hours = scam risk
- AI analyzes conversation patterns, inconsistencies

### Room Recommendation Logic (AI Chatbot)
- For sharing room requests: prioritize 2 tenants renting together (as a pair)
- Avoid single tenant in sharing room — push for single room instead
- Reason: Single tenant in sharing room makes vacant bed less attractive (strangers don't want to share with unknown person)
- Use this logic in chatbot room recommendations to maximize occupancy

### Blacklist System (Phase 02)
- Store: Name, phone, email, IC, last location, blacklisted by (name+number), reason, date
- Auto-scan prospect against blacklist
- Import from FB groups, fellow subletters, manual input

### Landlord Dashboard
- Full sidebar navigation
- Properties, Tenants, Payments, Reports, Settings

</specifics>

<deferred>
## Deferred Ideas

### Room Model (Phase 02)
- Multiple rooms per property
- Room photos gallery
- Vacant/occupied status
- Prospect interest tracking
- Discuss in Phase 02

### E-sign Implementation
- Library selection
- Document template
- Delivery via WhatsApp + Email

### Marketing Automation (Phase 06)
- Platform APIs integration (Facebook, Instagram, Telegram, X, Threads, LinkedIn, Lemon8)
- AI photo enhancement implementation
- Predictive analytics for targeting
- Peak time posting algorithm
- Engagement tracking

### Public/Admin Route Separation
- Route structure
- Component duplication vs shared

</deferred>

---

*Phase: 01-foundation-infrastructure*
*Context gathered: 2026-04-13*
*Updated from discussion*