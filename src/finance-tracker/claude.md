# Finance Tracker — Nuxt/Vue App

## Context

The user currently manages household finances in a spreadsheet with three sheets: a monthly budget sheet (income, pension contributions, outgoings tagged Needs/Wants/Savings for the 50/30/20 rule, covering both the user and their partner), a pension sheet, and a mortgage sheet. They want a Nuxt/Vue web app replacing this spreadsheet so both partners can view and edit the data with proper visualizations, instead of a flat grid.

Confirmed decisions:
- **Auth**: separate login per person, linked into a shared "household" so combined data is visible to both while individual records (income, pension, mortgage holder) stay attributable to a person. **`/login` is the only page reachable without a session — there is no public self-service registration.** Since this app only ever has two known users, both accounts (and the household linking them) are provisioned once via a seed script rather than an open sign-up form; every other route (dashboard, budget, pension, mortgages, settings) is behind auth middleware.
- **Mortgages**: a household can have multiple mortgages, all visible to both partners, each with a "holder" (you / partner / joint).
- **Hosting**: Azure, using free credits — Azure Container Apps for the app, Azure Database for PostgreSQL (Flexible Server, Burstable B1ms) for data.
- Currency: GBP by default, stored per-household so it's not hardcoded.
- **Out of scope for this plan**: importing the existing spreadsheet data. The user will plan that separately once they can supply the actual CSV (so the mapping can target real column headers rather than a guessed schema). This plan covers building the app with manual data entry only.

This is a brand-new project (empty directory, no git repo yet).

## Tech Stack

- **Nuxt 4** (SSR/universal mode), `app/` directory layout. SSR matters because this is an authenticated dashboard — auth middleware needs to run server-side before render.
- **Database**: Azure Database for PostgreSQL Flexible Server, Burstable B1ms (~$12-13/mo, cheapest non-trivial tier — fits a 2-user household app). Local dev uses Postgres via Docker Compose so work isn't blocked on Azure provisioning.
- **ORM**: Drizzle ORM (`drizzle-orm/postgres-js` + `drizzle-kit` for migrations) — no native binary engine to containerize, code-first schema maps cleanly to Postgres types.
- **Auth**: `nuxt-auth-utils` (sealed-cookie sessions, built-in `hashPassword`/`verifyPassword`, `requireUserSession`). No registration endpoint is exposed — accounts are created by a local seed script using the same `hashPassword` helper.
- **UI**: `@nuxt/ui` (Tailwind-based, prebuilt `UTable`/`UForm`/`UModal`/`USelectMenu`) for budget tables and CRUD modals.
- **Charts**: `chart.js` + `vue-chartjs` for the Needs/Wants/Savings donut and pension/mortgage value-over-time lines.
- **Validation**: `zod` schemas in a `shared/` directory, used by both `@nuxt/ui` forms (client) and Nitro API routes (server) so validation never drifts.

## Data Model (Drizzle, Postgres)

All domain tables FK directly to `householdId` (not just transitively via user) so household-scoped queries are a single indexed filter. Money fields use `numeric(12,2)`.

- **`households`**: id, name, currency (default `GBP`)
- **`users`**: id, householdId, email (unique), passwordHash, displayName — both rows created once by the seed script, already assigned to the same household (no dynamic invite/join mechanism, since membership never changes for this app)
- **`income_sources`**: id, householdId, userId, name, monthlyGrossAmount, monthlyNetAmount, pensionContributionPercent, effectiveFrom/To (income is always person-level)
- **`expense_categories`**: id, householdId, name, bucket (enum `need`/`want`/`saving`), isArchived — seeded with sensible defaults (Rent→need, Groceries→need, Dining Out→want, Pension AVCs→saving, etc.) on household creation
- **`budget_entries`**: id, householdId, categoryId, userId (**nullable = joint expense**), month (first-of-month date), amount, notes. Unique on (categoryId, userId, month). Drives both household-combined and per-person 50/30/20 views.
- **`pension_accounts`**: id, householdId, userId, provider, accountName, currentValue, employee/employerContributionMonthly, contributionPercent, targetRetirementAge
- **`pension_value_history`**: id, pensionAccountId, valueDate, value — feeds the growth chart
- **`mortgages`**: id, householdId, holderUserId (**nullable = joint**), lender, originalAmount, currentBalance, interestRate, rateType, fixedRateEndDate, monthlyPayment, startDate
- **`mortgage_balance_history`**: id, mortgageId, balanceDate, balance

Convention used consistently: a nullable FK to `users` means "joint/household-level"; non-null means person-attributed. Applies to `budget_entries.userId` and `mortgages.holderUserId`.

## App Structure

```
app/
  pages/ login.vue, dashboard.vue,
         budget/index.vue, pension/index.vue, mortgages/index.vue,
         settings/index.vue
  components/ budget/ (BudgetTable, BudgetEntryModal, BudgetDonutChart, BudgetBucketSummary)
              pension/ (PensionAccountCard, PensionAccountModal, PensionValueChart)
              mortgage/ (MortgageCard, MortgageModal, MortgageBalanceChart)
  composables/ useHousehold, useBudget, usePension, useMortgage
  middleware/ auth.global.ts   <- redirects to /login for every route except /login itself
server/
  api/ auth/{login,logout}, household/index (read-only, for settings page),
       settings/change-password,
       budget/{categories,entries}, pension/accounts(+history), mortgages(+history)
  database/ schema/*.ts, index.ts (drizzle client), migrations/, seed.ts  <- one-off script creating the household + 2 users
  utils/ session.ts, householdScope.ts  <- shared helper enforcing `WHERE household_id = :id` on every query
shared/
  schemas/ budget.ts, pension.ts, mortgage.ts
Dockerfile, drizzle.config.ts, nuxt.config.ts
```

`householdScope.ts` is the key security primitive: every API handler calls `requireUserSession`, resolves `householdId`, and every query filters on it — so one partner can never read the other household's data by guessing an id.

`auth.global.ts` allow-lists exactly one public route, `/login`; every other path (including the root) requires `requireUserSession` to succeed server-side or the middleware redirects. Since accounts are seeded rather than self-registered, users should change their seeded password on first login via a small form on `/settings` (`POST /api/settings/change-password`, requires current session).

## Dashboard & Editing UX

- **`/dashboard`**: month selector, household-combined Needs/Wants/Savings donut vs 50/30/20 target with a toggle for per-person breakdown, pension summary (total value + per-account sparklines), mortgage summary (total balance + per-mortgage sparklines with holder badges). Links into each module's full page.
- **`/budget`**: table grouped by bucket, inline cell editing (click-to-edit amount, matches spreadsheet muscle memory) for existing entries; modal only for adding a new category/person/month combination.
- **`/pension`** and **`/mortgages`**: card grid, modal forms for full edits (too many fields for inline), plus a lightweight "+ add value/balance update" quick action for the recurring monthly data point.

## Azure Deployment

1. Multi-stage `Dockerfile`: build stage (`node:22-alpine`, `npm ci && npm run build`), runtime stage copies only `.output/`, runs `node .output/server/index.mjs`.
2. `az group create` (uksouth) → `az postgres flexible-server create` (Burstable B1ms, Postgres 16, firewall restricted to Azure services + dev IP, not open internet).
3. Run `drizzle-kit migrate` against the Azure DB once before first deploy.
4. `az containerapp up --source . --ingress external --target-port 3000` — builds from source and deploys without manually wiring an ACR.
5. Secrets via `az containerapp secret set` for `DATABASE_URL` and `NUXT_SESSION_PASSWORD` (32+ chars), wired in with `--set-env-vars KEY=secretref:name`.
6. `--min-replicas 0 --max-replicas 1` to scale to zero between use, given this is a 2-user app and the goal is to conserve credits.
7. CI/CD: manual `az containerapp up --source .` re-run for v1; GitHub Actions deploy workflow is a later nice-to-have, not built now.

## Phased Build Order

0. **Scaffold & schema** — Nuxt 4 init, install all deps, write Drizzle schema + first migration, local Postgres via Docker Compose. *Verify: `npm run dev` boots, migrations apply.*
1. **Auth & household** — `seed.ts` creating the household + both user accounts, `/login` page, session middleware allow-listing only `/login`, settings change-password form. *Verify: both seeded accounts can log in at `/login`; any other URL visited while logged out redirects to `/login`.*
2. **Budget module** — categories CRUD, `budget_entries` CRUD, inline-editable table, donut chart, month nav. *Verify: a full month's budget can be entered and the 50/30/20 split is visible.*
3. **Pension module** — accounts + value history CRUD, cards, line chart.
4. **Mortgage module** — same pattern, with holder/joint attribution and multi-mortgage list.
5. **Dashboard aggregation** — `/dashboard` pulling real data from the above (built last since it depends on their APIs existing).
6. **Azure deployment** — Dockerfile, provision Postgres, `az containerapp up`, secrets, end-to-end smoke test with both accounts from separate devices.

This order gets the highest-value, most spreadsheet-equivalent feature (budget/50-30-20) working right after auth, and leaves cloud deployment last so iteration happens on localhost first. CSV import (bringing in the real spreadsheet data) is deliberately excluded from this plan — it'll be scoped separately once the actual CSV export and its real column headers are available.

## Verification

- Phase 0-1: `npm run dev`, run `seed.ts` to create the household + two accounts, confirm both can log in at `/login`, confirm every other route (`/dashboard`, `/budget`, etc.) redirects to `/login` when not authenticated and is reachable once logged in.
- Phase 2-4: manually exercise each module's CRUD in the browser (add/edit/delete budget entries, pension accounts, mortgages), confirm charts render and the 50/30/20 totals match manual arithmetic, confirm a second logged-in user (partner account) sees the same household data.
- Phase 6: hit the deployed Azure URL from a phone/second device, log in as both accounts, confirm data matches local.

## Progress

- **Phase 0 — done.** Nuxt 4 scaffolded, all dependencies installed, Drizzle schema written across `server/database/schema/*.ts`, first migration generated and applied to local Postgres (via `docker-compose.yml`), `npm run dev` boots cleanly.
- **Phase 1 — done.** Seed script, auth API routes, `householdScope`/`session` utils, `/login` page, `auth.global.ts` middleware, and the settings change-password form are written. Household seeded locally with real accounts (credentials live only in the gitignored `.env`, never `.env.example`). Verified end-to-end in the browser: unauthenticated visits redirect to `/login`, login reaches `/dashboard`, logout clears the session and redirects back to `/login`. Fixed a bug along the way — `app.vue` never wrapped `<NuxtPage>` in `<NuxtLayout>`, so the nav/logout shell in `app/layouts/default.vue` wasn't rendering on any page.
- **Phase 2 — done.** Categories + budget entries CRUD (`server/api/budget/`), inline-editable `BudgetTable`, `BudgetEntryModal` (supports creating a new category inline), `BudgetDonutChart`, `BudgetBucketSummary` showing actual vs. 50/30/20 target, month nav via `useBudget`/`app/utils/month.ts`. Verified end-to-end in the browser: add an entry (incl. a brand-new category), inline-edit its amount, delete it by clearing the value, donut/bucket totals update correctly. Fixed a bug along the way — `BudgetTable`'s inline-edit input is `type="number"`, which Vue's `v-model` silently coerces to a `Number` at runtime; `commitEdit` called `.trim()` on that value assuming it was always a string, throwing and leaving the cell stuck in edit mode on every successful edit (clearing to delete happened to survive since an empty string stays a string).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
