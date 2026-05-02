# External Integrations

**Analysis Date:** 2026-04-05

## APIs & External Services

**Excel Integration:**
- Microsoft Graph API [PLANNED] - Excel Online sync
  - Implementation: Direct API calls for spreadsheet updates
  - Auth: OAuth 2.0 via Azure AD
- Power Automate [PLANNED] - Workflow automation (transaction → Excel)
- Zapier [PLANNED] - Alternative workflow automation option
- CSV/XLSX Export [PLANNED] - Manual export with headers matching Excel template

## Data Storage

**Database:**
- [PLANNED] - PostgreSQL/MySQL with Prisma ORM
  - Connection: `DATABASE_URL` environment variable
  - Conventions: snake_case columns, UUID primary keys, soft deletes

**File Storage:**
- [PLANNED] - Cloud storage for receipts/contracts (S3 or equivalent)

**Caching:**
- [PLANNED] - Redis (optional for session/cache)

## Authentication & Identity

**Auth Provider:**
- [PLANNED] - NextAuth.js or custom JWT-based auth
  - Implementation: JWT tokens with environment-secured secrets
  - Multi-user access per idea.md

## Monitoring & Observability

**Error Tracking:**
- [PLANNED] - Sentry or similar (optional)

**Logs:**
- [PLANNED] - Console logging during development, structured logging in production

## CI/CD & Deployment

**Hosting:**
- [PLANNED] - Vercel or similar (Next.js optimized)
- [PLANNED] - Alternative: Docker containerized deployment

**CI Pipeline:**
- [PLANNED] - GitHub Actions
  - Commands: `npm run lint`, `npm run typecheck`, `npm test`

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` / `JWT_SECRET` - Auth secret key
- `MICROSOFT_CLIENT_ID` - Azure AD app registration
- `MICROSOFT_CLIENT_SECRET` - Azure AD app secret
- `NEXT_PUBLIC_*` - Client-exposed variables

**Secrets location:**
- `.env.local` for local development
- Platform environment variables for deployment

## Webhooks & Callbacks

**Incoming:**
- [PLANNED] - Payment gateway webhooks (IPay88/SenangPay or similar Malaysian providers)
- [PLANNED] - Microsoft Graph API callbacks

**Outgoing:**
- [PLANNED] - Power Automate/Zapier triggers
- [PLANNED] - Email notifications (SendGrid/Resend)

## Malaysian Market Compliance

**Payment Providers:**
- [PLANNED] - IPay88 or SenangPay integration
- [PLANNED] - Bank transfer reconciliation

**Accounting:**
- [PLANNED] - Excel templates matching Malaysian accounting standards
- [PLANNED] - Fiscal year alignment for reports
- [PLANNED] - Tax calculations per Malaysian tax standards

---

*Integration audit: 2026-04-05*
