---
title: Auth and households
type: architecture
status: active
updated: 2026-10-25
sources: [docs/raw/2026-06-finance-tracker-plan.md]
---

# Auth and households

Each partner has their own login. Both accounts belong to one **household**, which owns all the data. There is no public registration.

## How it works

- **Provisioning:** `npm run db:seed` creates the household and both users once, from `SEED_*` variables in `src/app/.env` (see `.env.example`). It refuses to run if a household already exists.
- **Login:** `POST /api/auth/login` checks the password with `verifyPassword`, then `setUserSession` stores `{ id, householdId, email, displayName }` in a sealed cookie. The session's type is declared in `layers/core/shared/types/auth.d.ts`.
- **Logout:** `POST /api/auth/logout`.
- **Change password:** `POST /api/settings/change-password`, from the `/settings` page. Seeded users should change their password on first login.
- **Route guard:** `layers/core/app/middleware/auth.global.ts` lets only `/login` through without a session and sends a logged-in user from `/login` to `/dashboard`.
- **API guard:** every handler calls `requireHouseholdSession(event)` (`layers/core/server/utils/session.ts`), which returns `{ userId, householdId }` or responds with 401.
- **Household scoping:** every query filters with `householdScope(table.householdId, householdId)` (`layers/core/server/utils/householdScope.ts`). This is the security boundary. See [data conventions](../conventions/data-conventions.md).

## Environment

| Variable | Used for |
|---|---|
| `DATABASE_URL` | Postgres connection |
| `NUXT_SESSION_PASSWORD` | Cookie sealing (32+ characters) |
| `HOUSEHOLD_*`, `SEED_USER{1,2}_*` | Seed script only |

## Related

- [Core](../domains/core.md)
- [Data conventions](../conventions/data-conventions.md)
