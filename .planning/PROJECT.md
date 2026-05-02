# Project: Sublet Room Rental Management Platform

**Hosted by:** AMR Home Solutions  
**Type:** Co-living room rentals

---

## Business Model

**Sublet** = sub-let = letting whole property, then sub-letting by individual rooms:
- Sublet properties → fully furnish → rent individual rooms to tenants
- Target: Young adults fresh in workforce who can't afford whole property
- Dual purpose:
  1. Profit from room rentals
  2. "Amal jariah" — help less fortunate build careers

**Revenue Model:** Rental income from furnished rooms. 
- The property owner might be AMR Homes OR JV Stakeholders (who let their property for AMR to sublet and manage).
- AMR Homes may also own properties and become a JV Stakeholder itself, subletting their own properties.

---

## Vision

A fully automated AI-powered co-living room rental platform that fills rooms within 1 week to 1 month through viral marketing. Admins only provide materials (photos/videos) — AI handles everything else. Admins involved only for viewing, closing, or exiting.

---

## Mission

- Provide affordable rooms for young adults starting their careers
- Automate 100% of rental funnel: listing → AI content → marketing → inquiry → AI filter → viewing → offer → acceptance → tenancy
- Full automation with AI-named bot "AIrene" handling all engagements
- All activity/transaction done online fully automated
- Transparent access for JV stakeholders within vicinity
- Help less fortunate build their careers ("amal jariah")

---

## What This Is

An AI-powered co-living room rental platform that helps AMR Home Solutions:
- Create room listings automatically with AI-generated descriptions and media
- Edit photos/videos automatically for viral marketing
- Post across Instagram, Facebook, WhatsApp, and website
- AIrene bot filters and engages with prospects
- Capture inquiries and schedule viewings automatically
- Process rental offers with automated evaluation
- Track tenants, leases, and payments
- Generate financial reports for tax compliance (Malaysia accounting standard)
- Provide JV stakeholders with limited dashboard for their properties
- Damage reporting and exit process at end of tenancy
- Fullset Excel exports for Malaysian accounting standards

**Core Value:** Fully automated rental business with minimal manual effort — from listing to acceptance.

---

## Accounting Requirements (Sole Proprietor - AMR Home Solutions)

### Malaysia Accounting Standard
- Fullset accounts per Malaysian accounting standards
- Different treatment from companies (sole proprietor vs Sdn Bhd)

### For Tax Filing (LHDN)
- Annual P&L by income source
- Deductible expenses by income source
- Form B reporting (sole proprietor personal income tax)

### For Zakat
- Zakat perniagaan calculation (different from company)
- Zakat offset against tax

### For Loan Applications
- Monthly recurring rental income tracking
- Profit per income source
- Expense ratio analysis
- Growth trend over 6-12 months

---

## Context

**Inspiration:** AMR Home Solutions (clean, minimalist, orange + dark grey — refer AMR Home Solutions logo in sublet folder)

**Target Users:**
- **AMR Homes Admins:** Full access to everything (manage properties, tenants, finances, AI funnel)
- **JV Stakeholders:** Let their property for AMR to sublet and manage. Their contribution is their properties. In return they get profit sharing portion.
- **Prospect Tenants:** Selective, all online fully automated via AIrene
- **Property Owners (Future):** In next project, external property owners may contact to list properties for AMR Homes to sublet. Pioneer project focuses on AMR success first.

**Key Differentiators:**
- Malaysian Ringgit (MYR) native support
- Multi-income-source rental tracking
- Consolidated financial reports
- Built-in Excel export for Malaysian accounting
- Audit trail and downloadable receipts
- Mobile-friendly interface
- Zakat and tax calculation for Malaysian sole proprietor compliance
- AI bot named "AIrene" for all engagements
- Fully automated AI funnel
- Damage reporting and exit process

**Constraints:**
- Sole proprietorship (AMR Home Solutions) — different accounting/tax treatment
- Malaysian market focus
- Must integrate with Excel for accounting workflows
- All transactions online fully automated

---

## Core Features

1. **Tenant/Property Management** — Full property and room management
2. **Financial Tracking** — Fullset accounts under Malaysia accounting standard
3. **Excel Exports** — Complete Excel exports for accounting
4. **Notifications** — Automated reminders and alerts
5. **AI Bot "AIrene"** — Handles all engagements from start to finish
6. **Damage Reporting** — At end of tenancy (v3.0)
7. **Exit Process** — After tenants exit (v3.0)

---

## Requirements

### v1.0 MVP
- [x] Next.js 16 project scaffold with TypeScript and App Router
- [x] Prisma ORM with SQLite database
- [x] User authentication with email/password
- [x] Database schema for properties, tenants, payments
- [x] MYR currency utilities with sen integer storage
- [x] Audit trail fields (createdAt, updatedAt, deletedAt)
- [x] Tailwind CSS 4 with shadcn/ui component library
- [x] Base layout with navigation
- [x] Property management with rooms
- [x] Tenant management with required IC number
- [x] Lease agreement management
- [x] Payment recording system
- [x] Receipt generation
- [x] Financial dashboard
- [x] Excel/CSV export
- [x] Notification system

### v1.1 Tax & Zakat + Auto Marketing
- [x] LHDN progressive tax brackets with Zakat perniagaan calculation
- [x] P&L Statement with Zakat calculation
- [x] Tax calculation with Zakat offset
- [x] Marketing channel configuration
- [x] Social media posting
- [x] WhatsApp integration
- [x] Website integration
- [x] Auto-post trigger

### v2.0 Multi-Income-Source Accounting
- [x] Dashboard with YTD summary
- [x] Income source field
- [x] Expense allocation
- [x] Profit-by-source reports
- [x] Consolidated P&L
- [x] Balance Sheet
- [x] Financial report exports

### v3.0 AI Automation Funnel + Damage Reporting + Exit
- [x] Room listings with media gallery
- [x] AI-powered description generation
- [x] Multi-channel marketing distribution
- [x] Prospect inquiry capture (AIrene)
- [x] Offer and viewing scheduling
- [x] JV stakeholder portal
- [x] Profit sharing calculation
- [x] Damage reporting at end of tenancy
- [x] Exit process after tenants exit

---

## Current State

**Entity:** AMR Home Solutions (SSM registered sole proprietorship)  
**Version:** v3.0 — AI Automation Funnel + Damage Reporting + Exit  
**Inspiration:** AMR Home Solutions (orange + grey)  
**Tech Stack:** Next.js 16, TypeScript, Prisma 7 + SQLite, Tailwind CSS 4  
**AI Bot:** AIrene (handles all engagements)

---

## Key Decisions

| Decision | Outcome |
|----------|---------|
| MYR with sen integer storage | Avoids floating-point issues |
| Prisma + SQLite | Simple deployment, easy migrations |
| Sole proprietor accounting | Different from company per Malaysia law |
| Income source on payments | Flexible allocation per transaction |
| AI bot "AIrene" | All engagements automated |

---

*Last updated: 2026-04-27*