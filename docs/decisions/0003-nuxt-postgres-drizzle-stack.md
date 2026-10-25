# 0003 — Nuxt 4 + Postgres + Drizzle stack

- **Status:** accepted
- **Date:** 2026-06 (recorded 2026-10-25)
- **Deciders:** user + agent

## Context

The household's finances lived in a spreadsheet. The replacement had to be a web app both partners can log into from any device, with charts instead of a flat grid. Later it had to grow into a wider household assistant. It's a two-user app, so cost and simplicity matter more than scale.

When J.A.R.V.I.S started (2026-10-25), a Next.js + Supabase + Vercel stack was suggested. The user's existing finance tracker already used the stack below, and it was kept.

## Decision

- **Nuxt 4** in SSR mode, with the `app/` directory layout. SSR lets auth middleware run on the server before render.
- **Postgres 16**, locally via Docker Compose.
- **Drizzle ORM** (`drizzle-orm/postgres-js`, `drizzle-kit` migrations): code-first schema, and no native engine binary to containerise.
- **nuxt-auth-utils** for sealed-cookie sessions and password hashing (see [0004](0004-seeded-household-accounts-no-signup.md)).
- **@nuxt/ui** (Tailwind) for components; **chart.js + vue-chartjs** for charts.
- **zod** schemas shared by forms and API routes, so validation can't drift between client and server.

## Alternatives considered

- **Next.js + Supabase (auth, database, storage) on Vercel:** less to run, but it would discard working code. Nuxt with Postgres covers the same needs.
- **Prisma:** a mature ORM, but its query engine binary complicates containers. Drizzle maps closely to SQL.
- **SPA without SSR:** simpler hosting, but the auth guard would run only on the client.

## Consequences

- One TypeScript codebase for UI and API. It's split by domain with Nuxt layers ([0001](0001-one-nuxt-app-with-a-layer-per-domain.md)).
- File storage (house photos, receipts) and scheduled jobs (bank and energy sync) aren't provided by the stack and need separate decisions later.
- Revisit if hosting needs change, for example to a platform without long-running Node.

## Related

- [Stack](../wiki/architecture/stack.md)
- [Raw: finance-tracker plan](../raw/2026-06-finance-tracker-plan.md)
