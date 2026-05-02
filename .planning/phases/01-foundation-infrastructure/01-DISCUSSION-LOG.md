# Phase 1: Foundation & Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 01-foundation-infrastructure
**Areas discussed:** Platform, Auth Model, UI/Design, Navigation, Property Page Structure

---

## Platform
| Option | Description | Selected |
|--------|-------------|----------|
| Mobile app | iOS/Android native app | |
| Web app | Browser-based application | ✓ |
| Web app, mobile-responsive | Works on phone and desktop | ✓ |

**User's choice:** Web app, mobile-responsive
**Notes:** Browser-based, works on mobile.

---

## Tenant Damage Reporting

| Option | Description | Selected |
|--------|-------------|----------|
| No damage reporting | Not included in tenant portal | |
| Text only | Tenant can report issues via text | |
| Photos only | Tenant can upload photos of damage | |
| Photos + Videos | Tenant can upload photos AND videos | ✓ |

**User's choice:** Photos + Videos
**Notes:** Tenant can report any damages to room, house, or appliances with photos and videos.

---

## Marketing Platforms

| Option | Description | Selected |
|--------|-------------|----------|
| Facebook only | Single platform | |
| Facebook + Instagram | Two platforms | |
| Multiple platforms | FB, IG, Telegram, X, Threads, LinkedIn | ✓ |
| Add Lemon8 | Malaysian lifestyle platform | ✓ |
| Add Ohmyhome | Malaysian rental platform | ✓ |

**User's choice:** Multiple platforms: Facebook, Instagram, Telegram, X (Twitter), Threads, LinkedIn, Lemon8
**Notes:** Cover all major platforms where potential tenants gather.

---

## Marketing Automation Timing

| Option | Description | Selected |
|--------|-------------|----------|
| After tenant moves out | Post when room is vacant | |
| Before contract ends | Post when tenant confirms not renewing | ✓ |
| Immediately | Auto-post right away | ✓ |

**User's choice:** Start posting once tenant confirms they are NOT going to continue renting — BEFORE they move out
**Notes:** Fill the room before current tenant moves out (proactive marketing).

---

## Marketing Posting Frequency

| Option | Description | Selected |
|--------|-------------|----------|
| Once a day | Single post daily | |
| Twice a day | Two posts daily | ✓ |
| Multiple times | More than twice | |

**User's choice:** Twice a day at peak times
**Notes:** Post twice daily — determined by AI when prospects are most active online.

---

## AI Photo Enhancement

| Option | Description | Selected |
|--------|-------------|----------|
| No AI enhancement | Use original photos | |
| Virtual staging | Add furniture to empty rooms | |
| Beautify only | Improve brightness/contrast WITHOUT changing layout | ✓ |

**User's choice:** Beautify only — AI can improve photo quality (brightness, colors) but must NOT rearrange furniture or change room layout
**Notes:** Make photos more attractive without misrepresenting the actual room.

---

## Predictive Analytics

| Option | Description | Selected |
|--------|-------------|----------|
| No tracking | Post to all platforms equally | |
| Basic tracking | Track which platform gets more views | |
| Full predictive | AI finds where prospects are, optimizes timing, tracks engagement | ✓ |

**User's choice:** Full predictive analytics
**Notes:** Use AI to:
- Find where potential tenants are active
- Track engagement per platform
- Optimize posting times (when prospects are online)
- Rearrange/edit posts for better performance

---

## Lead Qualification: Urgency Filtering

| Option | Description | Selected |
|--------|-------------|----------|
| No filtering | Answer all prospects equally | |
| Basic urgency | Ask "when do you need to move?" | |
| Full analysis | Good urgency vs bad urgency + lie detection | ✓ |

**User's choice:** Full analysis
**Notes:** Separate:
- ✅ Good urgency: New job, urgent duty, study — priority
- 🚫 Bad urgency: Kicked out, breach contract, damaged previous room — red flag
- AI detects lies: inconsistent answers, unusual hours

---

## Red Flag Detection

| Red Flag | Why Suspicious |
|----------|----------------|
| Contact late night (11pm-4am) | Desperation, not normal |
| "I have money, can pay now" | Rushes decision, no due diligence |
| No viewing needed | Too eager, avoid verification |
| Avoids background questions | Won't provide previous landlord info |
| Inconsistent stories | Different reasons each time asked |

**User's choice:** All of the above are red flags
**Notes:** Bot should flag these and alert landlord before proceeding.

---

## Blacklist System

| Feature | Description |
|---------|-------------|
| Store | Name, phone, email, IC, last location, blacklisted by (name+number), reason, date |
| Check | Auto-scan prospect against blacklist on inquiry |
| Import | From FB groups, fellow subletters, manual input |
| Defer | Discuss in Phase 02 (tenant management) |

**User's choice:** Defer to Phase 02
**Notes:** Will provide blacklist numbers/names as we go. Build system to store all data.

---

## Platform (reuse from earlier)

| Option | Description | Selected |
|--------|-------------|----------|
| Mobile app | iOS/Android native app | |
| Web app | Browser-based application | ✓ |
| Web app, mobile-responsive | Works on phone and desktop | ✓ |

**User's choice:** Web app, mobile-responsive
**Notes:** Browser-based, works on mobile.

---

## Auth Model - Public vs Protected

| Option | Description | Selected |
|--------|-------------|----------|
| All pages protected | Login required for everything | |
| Public listings, protected dashboard | No auth for property viewing, auth for landlord admin | ✓ |
| Public + Tenant portal | Public → Tenant login after deposit+lease → Landlord full access | ✓ |

**User's choice:** Public pages (no auth) → Tenant login after deposit + signed lease → Landlord full access
**Notes:** Anyone can view properties/rooms. Auth required only when prospect becomes tenant (after paying deposit + signing lease).

---

## Tenant Portal Features

| Option | Description | Selected |
|--------|-------------|----------|
| Pay rent only | Basic payment | |
| Pay rent + receipts | Add download receipts | |
| Pay rent + receipts + view lease | Full tenant view | |
| All above + e-sign tenancy | Full tenant portal | ✓ |

**User's choice:** All features: Pay rent, view lease, download receipts, online tenancy agreement
**Notes:** Tenants get full portal access.

---

## E-sign Delivery

| Option | Description | Selected |
|--------|-------------|----------|
| Email only | Send signed agreement via email | |
| WhatsApp only | Send via WhatsApp | |
| Email + WhatsApp | Both channels | ✓ |

**User's choice:** Both email AND WhatsApp — both landlord and tenant receive copies
**Notes:** Full transparency for both parties.

---

## UI/Design - Color Scheme

| Option | Description | Selected |
|--------|-------------|----------|
| White + blue/green | Hostfully-inspired | |
| White + orange | AMR Home Solutions inspired | ✓ |
| Other | User to specify | |

**User's choice:** White + Bright Orange (like the fruit orange)
**Notes:** Inspired by AMR Home Solutions logo. Clean, warm, inviting.

---

## Navigation - Public Pages

| Option | Description | Selected |
|--------|-------------|----------|
| Same as admin | Full sidebar on public pages | |
| Simplified | Just search + WhatsApp CTA | ✓ |
| Minimal | Just property listing, no nav | |

**User's choice:** Simplified — Search bar + WhatsApp contact button only
**Notes:** Less friction for prospects. Easy to decide → contact → pay.

---

## Property Page Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single property card | One card per property | |
| Property with room cards | Property overview + room grid | ✓ |
| List view | Table of all properties | |

**User's choice:** Property with room cards
**Notes:** Each property shows multiple rooms. Each room has:
- Photo gallery
- Vacant/Occupied status
- Price
- "I'm interested" button

---

## Property Page Sections

| Section | Content | Selected |
|---------|---------|----------|
| Top | Property name, address, location map | ✓ |
| Middle | Room cards grid | ✓ |
| Bottom | Contact via WhatsApp | ✓ |
| Amenities | Nearby amenities with distances | ✓ |
| Transport | Public transport (LRT/bus) with walking times | ✓ |

**User's choice:** All sections
**Notes:** "Enticement info" — nearby amenities, transport to make prospects want to click and rent.

---

## Room Model (Deferred to Phase 02)

| Topic | Status |
|-------|--------|
| Multiple rooms per property | Deferred to Phase 02 |
| Room photos gallery | Deferred to Phase 02 |
| Vacant/occupied checkbox | Deferred to Phase 02 |
| Prospect interest tracking | Deferred to Phase 02 |

**Notes:** User wants to discuss room model in Phase 02, not Phase 01.

---

## OpenCode's Discretion

The following technical decisions deferred to OpenCode:
- Exact implementation of public vs protected route separation
- E-signature library/approach
- WhatsApp integration for document delivery
- Email service integration
- Exact shade of orange (bright orange, like the fruit)

---

## Previous Discussion (2026-04-05)

### Navigation Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard + Properties + Tenants + Settings | Clean, minimal | ✓ |
| Dashboard + Properties + Tenants + Payments + Settings | More granular | |
| Just Dashboard + Settings for now | Minimal | |

**User's choice:** Dashboard + Properties + Tenants + Settings

---

### Navigation Style

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar navigation | Left sidebar with icons and labels | |
| Top navigation bar | Horizontal nav at top | |
| Both sidebar (desktop) + hamburger menu (mobile) | Hybrid | ✓ |

**User's choice:** Hybrid (sidebar desktop + hamburger mobile)

---

### Visual Design

| Option | Description | Selected |
|--------|-------------|----------|
| Clean minimalist | White background, subtle shadows | ✓ |
| Compact/dense | More information, smaller spacing | |

**User's choice:** Clean minimalist

---

## Deferred Ideas

### Room Model
- Multiple rooms per property — Phase 02
- Room photos gallery — Phase 02
- Vacant/occupied status — Phase 02
- Prospect interest tracking — Phase 02

### E-sign Implementation
- Library selection — later
- Document template — later
- Delivery via WhatsApp + Email — later

### Public/Admin Route Separation
- Route structure — later
- Component patterns — later

---

*Last updated: 2026-04-13*