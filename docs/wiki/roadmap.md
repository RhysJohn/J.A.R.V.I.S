---
title: Roadmap
type: roadmap
status: active
updated: 2026-10-31
sources: [docs/raw/2026-10-25-jarvis-vision.md, docs/raw/2026-06-finance-tracker-plan.md, docs/decisions/0012-single-harness-check-for-hooks-and-ci.md]
---

# Roadmap

What's done, what's next and in what order, plus known issues. Update this page whenever an item changes state.

## Done

- **Scaffold:** Nuxt 4, Drizzle schema, local Postgres via Docker Compose.
- **Auth and household:** seed script, `/login`, global auth middleware, change password. See [auth and households](architecture/auth-and-households.md).
- **Budget:** categories and entries CRUD, inline-editable table, 50/30/20 donut and bucket summary, month navigation. See [finance](domains/finance.md#budget).
- **Restructure into J.A.R.V.I.S:** `src/app`, `core` and `finance` layers, layer-driven nav. See [ADR 0001](../decisions/0001-one-nuxt-app-with-a-layer-per-domain.md).
- **Knowledge base:** this wiki, `AGENTS.md`, and the role subagents.
- **Harness self-protection:** a trust rule, a guard hook, permission rules, the `integrity` check, CODEOWNERS and a read-only CI token. See [agent security](architecture/agent-security.md).
- **Quality gates:** one `npm run harness:check` runner (wiki, ADRs, presentation, schema drift, tests, typecheck baseline, build), shared by the Stop hooks and GitHub Actions CI. See [quality gates](architecture/quality-gates.md).
- **Validation:** presentation-only frontend (business logic in `app/logic`), Vitest unit and component projects (48 tests), the presentation guard, and Claude Code validation hooks. See [validation hooks](architecture/validation-hooks.md).

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

## Security backlog

The open findings from the [threat model](../raw/2026-10-31-threat-model.md). Findings 1–3 (harness self-protection) are done; see [agent security](architecture/agent-security.md).

1. **Household ownership (finding 4):** `POST /api/budget/entries` doesn't check that `categoryId`/`userId` belong to the household. Add ownership checks, composite foreign keys on `(household_id, id)`, and an isolation test suite.
2. **Dev environment and CI hygiene (findings 6–8):**
   - pin GitHub Actions to commit SHAs, enable Dependabot, add an audit check
   - add secret scanning (gitleaks), remove `SEED_*` from `.env` after seeding, gitignore raw CSV/OFX
   - bind local Postgres to `127.0.0.1`
3. **Before deploying (findings 5, 9, 10):**
   - decide how users authenticate (an identity layer in front of the app vs a hardened login), as an ADR
   - fix the login timing leak, and add rate limiting
   - make sessions revocable
   - add security headers and CSP (`nuxt-security`)
4. **Project plugin (finding 11):** review or move the `superpowers` plugin out of project settings.
5. **Sandbox for unattended agent runs (finding 3, residual):** decide when the loop and graph workflows define unattended runs.
6. **As features arrive (findings 12–14):** least-privilege integration tokens in Key Vault, confirmation before operating any device, an ADR before any in-app AI assistant, and an audit trail.

## Known issues

- `npm run typecheck` reports 4 errors carried over from finance-tracker, all null-safety in `server/database/seed.ts`. They're recorded in `harness/typecheck-baseline.json`. The build is unaffected. The 3 in the budget modal were fixed during the logic extraction.
- No server/API tests (including household isolation) or end-to-end tests yet.
- CI doesn't block merging until GitHub branch protection on `main` requires the `harness` check.
- No Dockerfile yet (needed for [deployment](architecture/deployment.md)).

## Related

- [Overview](overview.md)
- [Log](log.md)
