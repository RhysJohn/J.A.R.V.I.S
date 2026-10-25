# J.A.R.V.I.S — household life assistant

## What this is

A private web app for a two-person household (the user and their partner), hosted in the cloud with a separate login each. It grows one domain at a time:

- **Finance** — monthly budget against the 50/30/20 rule, pension, mortgages/loans, and (next) bank statement import to compare actual spend against the plan.
- **House** — the house was just bought: renovation projects (kitchen, bathroom, garden) with budgets, tasks, progress and photos, with real spend linked to finance transactions.
- **Meals** — meals the household likes, a weekly plan, and a combined shopping list that can be pasted into a supermarket (Tesco has no public basket API).
- **Todo / calendar** — shared todos and a calendar sync.
- **Home** — energy usage and bills (Octopus API or Glowmarkt/Bright for SMETS2 meters), and smart-home state (lights, temperature) via Home Assistant rather than per-brand integrations.

The app started life as the standalone `RhysJohn/finance-tracker` repo. That repo is now the **old** version; the code here is the one to build on.

## Tech stack

- **Nuxt 4** (SSR), split into **Nuxt layers** — one per domain (see below).
- **Postgres** via **Drizzle ORM** (`drizzle-orm/postgres-js`, `drizzle-kit` for migrations). Local dev uses Docker Compose.
- **Auth**: `nuxt-auth-utils` sealed-cookie sessions with email + password. No public sign-up: the household and both accounts are created once by `server/database/seed.ts`, and `/login` is the only route reachable without a session.
- **UI**: `@nuxt/ui` (Tailwind). **Charts**: `chart.js` + `vue-chartjs`.
- **Validation**: `zod` schemas in each layer's `shared/schemas/`, used by both forms and API routes.
- **Hosting (planned)**: Azure Container Apps (scale to zero, max 1 replica) + Azure Database for PostgreSQL Flexible Server (Burstable B1ms), region uksouth. Secrets via Container Apps secrets.

## Repo layout

```
CLAUDE.md, README.md
.claude/            settings + graphify skill
docs/decisions/     architecture decision records
src/app/            the Nuxt app (run all npm commands here)
  nuxt.config.ts    modules + global CSS only
  app/              app.vue, global CSS
  server/database/  shared Drizzle client (index.ts), composed schema (schema.ts), migrations/, seed.ts
  layers/
    core/           auth, household, settings, layout + nav, dashboard, currency/month helpers, householdScope
    finance/        budget, pension, mortgages
```

## Layer conventions

Nuxt auto-registers every folder in `src/app/layers/`. Each layer has the normal Nuxt structure (`app/`, `server/`, `shared/`, `nuxt.config.ts`), and its pages, components, composables, utils and API routes are auto-imported/registered as usual.

- **Imports across layers** use the named aliases `#layers/<name>/...`, e.g. `#layers/finance/shared/schemas/budget`. Server code imports the shared DB client from `~~/server/database` and tables from `~~/server/database/schema`.
- **Database tables** live in `layers/<name>/server/database/schema/`, with an `index.ts` re-exporting them. `src/app/server/database/schema.ts` composes every layer's schema, because there is one Postgres database and one migration history. Schema files use **relative imports only**: drizzle-kit and the seed script run outside Nuxt, where aliases don't resolve.
- **Relations**: core only relates `households` and `users` to each other. A feature layer declares its own `one(households)` / `one(users)` relations and never adds to core's relations, so core never depends on a feature layer.
- **Nav**: each layer adds its links in `app/app.config.ts` under `nav: [{ label, to, order }]`. Nuxt concatenates the arrays and the core layout sorts them by `order` (core 0 and 1000, finance 100s; give new layers their own hundred).
- **Dependency direction**: feature layers may depend on core; core must not depend on feature layers; feature layers should not depend on each other. Cross-domain links (e.g. a renovation project's spend from finance transactions) go through IDs and API calls. Put a genuinely shared concept into core instead.

### Adding a new layer

1. `layers/<name>/nuxt.config.ts` (`export default defineNuxtConfig({})`).
2. Tables in `layers/<name>/server/database/schema/` + `index.ts`, then add an `export *` line to `server/database/schema.ts`.
3. `npm run db:generate` to create the migration, then `npm run db:migrate`.
4. Nav links in `layers/<name>/app/app.config.ts`.
5. API routes in `layers/<name>/server/api/<name>/`, each calling `requireHouseholdSession` and filtering with `householdScope`.

## Data conventions

- Every domain table has its own `householdId` FK, not only via its user, so household scoping is a single indexed filter.
- Every API handler calls `requireHouseholdSession(event)` and filters every query with `householdScope(table.householdId, householdId)`. This is the security boundary: one household can't read another's rows by guessing an id.
- A **nullable** FK to `users` means joint/household-level, and a non-null one means attributed to that person (`budget_entries.userId`, `mortgages.holderUserId`).
- Money is `numeric(12,2)` with `mode: 'number'`. Currency is stored per household (default GBP).
- Months are first-of-month `date` strings (`YYYY-MM-01`); see `layers/core/app/utils/month.ts`.

## Commands (from `src/app`)

```
docker compose up -d      # local Postgres
npm run dev
npm run typecheck
npm run build
npm run db:generate       # after schema changes
npm run db:migrate
npm run db:seed           # one-off: household + both accounts from .env (see .env.example)
```

Real credentials live only in `src/app/.env` (gitignored), never in `.env.example`.

## Roadmap & status

**Done (carried over from finance-tracker):**
- Scaffold, schema, local Postgres.
- Auth + household: seed script, `/login`, global auth middleware, change password in settings.
- Budget: categories + entries CRUD, inline-editable table, 50/30/20 donut and bucket summary, month navigation.
- Restructure into J.A.R.V.I.S: `src/app`, `core` + `finance` layers, layer-driven nav.

**Next:**
1. Pension module: accounts + value history, cards, growth chart. The pages are placeholders; the tables exist.
2. Mortgage module: same pattern, with holder/joint attribution. Pages are placeholders; tables exist.
3. Statement import: transactions table, a CSV parser per bank, category-matching rules mapped to the existing `expense_categories`, and plan vs actual on the budget page.
4. Dashboard aggregation across modules.
5. Azure deployment: Dockerfile, provision, migrate, deploy, test with both accounts.
6. `house` layer: renovation projects with budget lines, tasks, progress, photos, and spend linked to transactions.
7. `meals` layer: recipes, weekly planner, aggregated shopping list export.
8. Todo / calendar.
9. Integrations: Open Banking feeds, energy data, Home Assistant.

**Known issues:** `npm run typecheck` reports 7 errors carried over from finance-tracker (`BudgetEntryModal.vue`, `seed.ts` null-safety). The build is unaffected.

## graphify

This project can have a knowledge graph at `graphify-out/` with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain don't surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.
