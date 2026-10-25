---
title: Roadmap
type: roadmap
status: active
updated: 2026-10-25
sources: [docs/raw/2026-10-25-jarvis-vision.md, docs/raw/2026-06-finance-tracker-plan.md]
---

# Roadmap

What's done, what's next and in what order, plus known issues. Update this page whenever an item changes state.

## Done

- **Scaffold:** Nuxt 4, Drizzle schema, local Postgres via Docker Compose.
- **Auth and household:** seed script, `/login`, global auth middleware, change password. See [auth and households](architecture/auth-and-households.md).
- **Budget:** categories and entries CRUD, inline-editable table, 50/30/20 donut and bucket summary, month navigation. See [finance](domains/finance.md#budget).
- **Restructure into J.A.R.V.I.S:** `src/app`, `core` and `finance` layers, layer-driven nav. See [ADR 0001](../decisions/0001-one-nuxt-app-with-a-layer-per-domain.md).
- **Knowledge base:** this wiki, `AGENTS.md`, and the role subagents.

## Next (in order)

1. **Pension module:** accounts and value history CRUD, cards, growth chart. The tables exist; the page is a placeholder. → [finance](domains/finance.md#pension)
2. **Mortgage module:** same pattern, with holder/joint attribution and multiple mortgages. → [finance](domains/finance.md#mortgages)
3. **Statement import:** transactions, a CSV parser per bank, category rules, plan vs actual. → [finance](domains/finance.md#statement-import-planned)
4. **Dashboard aggregation** across modules. → [core](domains/core.md)
5. **Azure deployment.** → [deployment](architecture/deployment.md)
6. **House layer.** → [house](domains/house.md)
7. **Meals layer.** → [meals](domains/meals.md)
8. **Planner** (todos and calendar). → [planner](domains/planner.md)
9. **Integrations:** [Open Banking](integrations/open-banking.md), [energy](integrations/energy.md), [Home Assistant](integrations/home-assistant.md).

## Known issues

- `npm run typecheck` reports 7 errors carried over from finance-tracker: null-safety in `layers/finance/app/components/budget/BudgetEntryModal.vue` (3) and `server/database/seed.ts` (4). The build is unaffected.
- No automated tests yet, and the `tests/` folder is empty.
- No Dockerfile yet (needed for [deployment](architecture/deployment.md)).

## Related

- [Overview](overview.md)
- [Log](log.md)
