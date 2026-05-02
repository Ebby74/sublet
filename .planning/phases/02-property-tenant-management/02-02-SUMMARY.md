---
phase: 02-property-tenant-management
plan: '02'
subsystem: tenant-management
tags:
  - tenant
  - ic-document
  - crud
  - lhdn-compliance
dependency_graph:
  requires: []
  provides:
    - tenant-service
    - tenant-components
    - tenant-api
    - tenant-pages
  affects:
    - dashboard-stats
    - lease-management
tech_stack:
  added:
    - tenant-service
    - tenant-components
    - tenant-api
  patterns:
    - soft-delete
    - progressive-forms
    - ic-document-upload
key_files:
  created:
    - src/services/tenant-service.ts
    - src/components/tenant/tenant-card.tsx
    - src/components/tenant/tenant-form.tsx
    - src/components/tenant/tenant-list.tsx
    - src/app/api/v1/tenants/route.ts
    - src/app/api/v1/tenants/[id]/route.ts
    - src/app/api/v1/tenants/upload/route.ts
    - src/app/tenants/page.tsx
    - src/app/tenants/new/page.tsx
    - src/app/tenants/[id]/page.tsx
  modified: []
decisions:
  - D-09: Tenant form with essential fields: name, phone, email
  - D-10: IC number required for all tenants (LHDN compliance)
  - D-11: IC document upload required — front and back image/PDF
  - D-12: IC documents stored in /public/uploads/tenants/{tenant_id}/
  - D-13: Progressive forms — optional details in expandable section
metrics:
  duration: ~5 minutes
  completed_date: '2026-04-08'
---

# Phase 02 Plan 02: Tenant Management Summary

## Overview
Implemented Tenant Management with IC document upload and progressive forms for the Sublet Property Management Platform.

## What Was Built

### Tenant Service (`src/services/tenant-service.ts`)
- CRUD operations: createTenant, getTenants, getTenant, updateTenant, deleteTenant
- IC document handling: saveTenantIcDocument, getTenantIcDocuments
- Soft delete support via deletedAt field
- icNumber required field for LHDN compliance

### Tenant Components
- **TenantCard**: Displays tenant info with IC number badge, phone, email, property
- **TenantForm**: Progressive form with required IC number and IC document upload
- **TenantList**: Cards/table view toggle for tenant listing

### Tenant API Routes
- `GET /api/v1/tenants` — List all tenants
- `POST /api/v1/tenants` — Create tenant
- `GET /api/v1/tenants/:id` — Get single tenant with leases
- `PUT /api/v1/tenants/:id` — Update tenant
- `DELETE /api/v1/tenants/:id` — Soft-delete tenant
- `POST /api/v1/tenants/upload` — Upload IC documents

### Tenant Pages
- `/tenants` — Tenant list with Add Tenant button
- `/tenants/new` — New tenant form with IC upload
- `/tenants/[id]` — Tenant detail with lease history

## Verification

### Acceptance Criteria Met
- [x] src/services/tenant-service.ts exists with all exports
- [x] Tenant components with phone, email, IC display
- [x] Tenant form requires IC number
- [x] Tenant form requires IC front/back upload
- [x] API routes for CRUD operations
- [x] Pages for list, create, detail views

### Success Criteria Met
- [x] User can add a tenant with contact details
- [x] User can add a tenant with IC number (required)
- [x] User can upload IC documents (required)
- [x] User can view tenant list with associated properties
- [x] User can soft-delete tenants

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| dae37ca | feat(02-02): create tenant service with CRUD and IC document handling | src/services/tenant-service.ts |
| 29b0046 | feat(02-02): create tenant components with IC handling | src/components/tenant/*.tsx |
| d9d88bf | feat(02-02): create tenant API routes with IC upload | src/app/api/v1/tenants/*.ts |
| b7abd16 | feat(02-02): create tenant pages with IC document handling | src/app/tenants/*.tsx |

## Deviations from Plan

None - plan executed exactly as written.

## Notes

- IC documents stored in `/public/uploads/tenants/{tenant_id}/`
- Tenant form uses progressive disclosure (expandable "More details" section)
- Demo user ID used for MVP (TODO: Replace with session-based auth)
- All entities use soft delete (deletedAt field)
