---
title: Core
type: domain
status: active
updated: 2026-10-25
sources: [docs/raw/2026-06-finance-tracker-plan.md]
---

# Core

The `core` layer (`src/app/layers/core`) holds everything shared by all domains: login, household, settings, the app shell and nav, the dashboard, and common helpers. Feature layers depend on it, and it depends on none of them.

## Pages

| Route | File | Status |
|---|---|---|
| `/` | `app/pages/index.vue` | Redirects to `/dashboard` |
| `/login` | `app/pages/login.vue` | Done; the only public route; no layout |
| `/dashboard` | `app/pages/dashboard.vue` | **Placeholder.** Will aggregate every domain |
| `/settings` | `app/pages/settings/index.vue` | Done: household info and change password |

## API

| Route | Purpose |
|---|---|
| `POST /api/auth/login` | Log in |
| `POST /api/auth/logout` | Log out |
| `GET /api/household` | Household with its users (id, displayName, email) |
| `POST /api/settings/change-password` | Change your own password |

## Shared building blocks

- **Layout:** `app/layouts/default.vue` shows the nav (merged from every layer's `app.config` `nav`, sorted by `order`), the user's name, and Log out.
- **Middleware:** `app/middleware/auth.global.ts`.
- **Composables:** `useHousehold()`, and `useAuth.ts` (`loginRequest`, `logoutRequest`, `changePasswordRequest`), so pages and the layout never call `$fetch` themselves.
- **Logic:** `app/logic/nav.ts` (`sortNavLinks`).
- **Utils (auto-imported in every layer):**
  - `formatCurrency` and `formatPercent` (`app/utils/currency.ts`)
  - `currentMonthString`, `shiftMonth` and `formatMonthLabel` (`app/utils/month.ts`)
- **Server utils:** `requireHouseholdSession` and `householdScope`.
- **Tables:** `households` and `users`.

## Dashboard (planned)

Once the finance modules are complete, the dashboard shows:
- a month selector
- the household 50/30/20 donut, with a per-person toggle
- a pension summary
- a mortgage summary

Other domains add their own cards later, such as project progress and this week's meals. A good approach is for each layer to register dashboard cards the same way it registers nav (`app.config`), so core never imports feature components. That needs deciding when the dashboard is built.

## Related

- [Auth and households](../architecture/auth-and-households.md)
- [Layers](../architecture/layers.md)
- [Finance](finance.md)
