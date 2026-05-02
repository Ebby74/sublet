# Technology Stack

**Analysis Date:** 2026-04-05

## Languages

**Primary:**
- TypeScript [PLANNED] - Strict mode, no `any` types
- CSS Modules [PLANNED] - Component-scoped styling

## Runtime

**Environment:**
- Node.js [PLANNED]

**Package Manager:**
- npm [PLANNED]
- Lockfile: `package-lock.json` [PLANNED]

## Frameworks

**Core:**
- Next.js [PLANNED] - Pages router (based on `pages/` convention in `src/` structure)
- React [PLANNED] - UI framework

**Testing:**
- Jest [PLANNED] - Test runner
- React Testing Library [PLANNED] - Component testing

**Build/Dev:**
- ESLint [PLANNED] - Linting
- Prettier [PLANNED] - Code formatting
- TypeScript compiler [PLANNED] - Type checking (`npm run typecheck`)

## Key Dependencies

**Critical:**
- Prisma [PLANNED] - ORM for database access
- clsx [PLANNED] - Conditional className utility (referenced in AGENTS.md)

**UI:**
- [PLANNED] - UI component library (shadcn/ui style components)

**Utilities:**
- date-fns or dayjs [PLANNED] - Date formatting
- Intl.NumberFormat [PLANNED] - Malaysian Ringgit currency formatting

## Configuration

**Environment:**
- `.env` files for configuration
- Environment variables for secrets (never hardcoded)
- Required: Database URL, API keys

**Build:**
- `tsconfig.json` - TypeScript configuration
- `.eslintrc` / `eslint.config.js` - Linting rules
- `.prettierrc` - Code formatting rules
- `jest.config.js` / `vitest.config.ts` - Test configuration
- `next.config.js` - Next.js configuration

## Platform Requirements

**Development:**
- Node.js 18+ recommended
- npm 9+

**Production:**
- Node.js runtime or serverless (Vercel/Netlify)

---

*Stack analysis: 2026-04-05*
