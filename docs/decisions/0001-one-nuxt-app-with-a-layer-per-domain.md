# 0001 — One Nuxt app, one layer per domain

- **Status:** accepted
- **Date:** 2026-10-25

## Context

J.A.R.V.I.S started from the standalone finance-tracker app (Nuxt 4, Drizzle, Postgres, `nuxt-auth-utils`) and will grow to cover house projects, meals, todos/calendar, energy and smart home. These domains share the same household, users and login, and some share data: renovation spend comes from finance transactions.

## Decision

- Keep a single Nuxt app in `src/app`, deployed as one container with one Postgres database.
- Split it into Nuxt layers under `src/app/layers/`: `core` (auth, household, settings, shell) plus one layer per domain, starting with `finance`.
- Each layer owns its pages, components, API routes, zod schemas and Drizzle tables. `server/database/schema.ts` composes all tables into one schema and one migration history.
- Layers register their own nav links through `app.config` so core never references a feature layer.
- Dependencies point one way: feature layers depend on core, never on each other.

## Alternatives considered

- **Separate apps per domain:** each would need its own auth, deployment and database, and cross-domain views (project spend, the dashboard) would need inter-app APIs. Too much overhead for a two-user household app.
- **A single flat Nuxt app:** the simplest option, but the budget, renovation and meal code would intermix in `pages/`, `components/` and `server/api/` with no boundaries.
- **A separate database schema or migration history per layer:** cleaner isolation, but drizzle-kit works best with one schema, and cross-layer FKs (to `households`/`users`) cross schemas anyway.

## Consequences

- Adding a domain means adding a folder plus one line in `schema.ts`. See "Adding a new layer" in CLAUDE.md.
- Drizzle schema files must use relative imports, because drizzle-kit and the seed script run outside Nuxt.
- The seed script stays at the app root because it seeds across layers (household, users, default budget categories).
