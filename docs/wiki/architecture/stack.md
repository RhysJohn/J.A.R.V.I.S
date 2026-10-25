---
title: Stack
type: architecture
status: active
updated: 2026-10-25
sources: [docs/raw/2026-06-finance-tracker-plan.md]
---

# Stack

The technology choices, inherited from finance-tracker and kept for J.A.R.V.I.S.

| Concern | Choice | Why |
|---|---|---|
| Framework | **Nuxt 4** (SSR), `app/` directory layout, split into [layers](layers.md) | SSR lets the auth middleware run server-side before render; layers keep domains separate |
| Database | **Postgres 16** (local: Docker Compose; cloud: Azure Flexible Server) | Relational data, cheap managed option |
| ORM | **Drizzle** (`drizzle-orm/postgres-js`, `drizzle-kit`) | No native engine binary to containerise; code-first schema. See [database](database.md) |
| Auth | **nuxt-auth-utils** (sealed-cookie sessions, `hashPassword`/`verifyPassword`) | Simple for two known users. See [auth and households](auth-and-households.md) |
| UI | **@nuxt/ui** v4 (Tailwind) | Prebuilt tables, forms and modals |
| Charts | **chart.js** + **vue-chartjs** | Donut and line charts |
| Validation | **zod**, shared between forms and API routes | Validation never drifts between client and server |
| Types | **TypeScript 5** + **vue-tsc** (`npm run typecheck`) | vue-tsc doesn't support TypeScript 7 yet, so stay on 5 |
| Tests | **Vitest 5** with two projects: `unit` (Node) and `component` (`@nuxt/test-utils` Nuxt environment, happy-dom, `@vue/test-utils`) | Fast logic tests, and real Nuxt rendering for components. See [frontend architecture](../conventions/frontend-architecture.md) |
| Hosting | **Azure Container Apps** + **Azure Database for PostgreSQL** | Uses free credits; scale to zero. See [deployment](deployment.md) |

## Related

- [Layers](layers.md)
- [Database](database.md)
- [Deployment](deployment.md)
