# Idea.md - Sublet Room Rental Management Platform

## Objective

**Sublet** = sub-let = letting whole property, then sub-letting by individual rooms.
- Target: Young adults fresh in workforce who can't afford whole property
- Dual purpose:
  1. Profit from room rentals
  2. "Amal jariah" — help less fortunate build careers

## Inspiration

**AMR Home Solutions** (clean, minimalist, orange + grey — refer AMR Home Solutions logo in sublet folder)

---

## Main Functions

1. **Dashboard** - Summary of properties, tenants, monthly income, tasks, bookings
2. **Property & Tenant Management** - Property list, floor/room structure, tenant information, rental status
3. **AI Automation Funnel** - AI bot "AIrene" handles all engagements:
   - Room listings with media
   - AI-generated descriptions/captions
   - Auto-post to all channels
   - Prospect inquiry capture
   - Offer/viewing system
4. **Financial Reports** - Income, expenses, profit by source, consolidated financials
5. **Malaysian Compliance** - Fullset accounts per Malaysia accounting standard, LHDN tax, Zakat perniagaan
6. **Excel Export** - Business summaries, tax reports, SSM templates
7. **Notifications** - Reminders, receipts, contracts
8. **JV Stakeholder Portal** - Limited view for JV partners. AMR Homes may also own properties and become a JV Stakeholder itself.
9. **Damage Reporting** - Document damages during tenancy
10. **Exit Process** - Exit checklist, final payment, deposit return

---

## Visual Mockup

### Design Theme
- **Colors:** Orange + Grey (AMR Home Solutions inspired)
- **Style:** Clean, minimalist, modern

### Desktop
- Landing Page: Logo, navigation, hero section, feature boxes, dashboard preview, CTA banner
- Dashboard: Summary of properties, rooms, monthly income, Income & Expenses chart, Occupancy Rate
- Financial Reports: Financial summary, overview chart, transaction schedule & outstanding payments
- AI Marketing: Room listings, AI content generation, channel posting, prospect pipeline
- JV Dashboard: Property performance, income/expenses, profit sharing

### Mobile
- Dashboard, Financial Page, Tenants, Properties, Prospect Inquiries, Leases, Settings, Profile

---

## AI Bot: AIrene

AIrene handles ALL engagements from start to finish:
- Responds to all inquiries
- Qualifies prospects
- Schedules viewings
- Handles offers
- Manages exit process

Admins only involved for:
- Providing materials (photos/videos)
- Viewing sessions
- Closing deals
- Exit inspections

---

## Excel Integration

- Export CSV/XLSX for reports
- Database → Excel with column mapping
- Fullset accounts per Malaysia accounting standard
- SSM Form 9 and Form 44 templates

---

## Target Users

| User | Access |
|------|--------|
| **AMR Homes Admins** | Full access to everything |
| **JV Stakeholders** | Let their property for AMR to sublet. Contribute properties, get profit sharing. |
| **Prospect Tenants** | Selective, all online fully automated via AIrene |
| **Property Owners (Future)** | Next project - external owners may list properties for AMR to sublet |

---

## Malaysian Compliance

- **Entity:** Sole Proprietorship (AMR Home Solutions) - different from company
- **Currency:** Malaysian Ringgit (MYR)
- **Tax:** LHDN Form B for sole proprietor
- **Zakat:** Zakat perniagaan at 2.5% with RM 20,000 nisab
- **Accounting:** Fullset accounts per Malaysia accounting standard

---

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Prisma 7 + SQLite
- Tailwind CSS 4
- shadcn/ui components
- Recharts
- xlsx library

---

*Last updated: 2026-04-27*