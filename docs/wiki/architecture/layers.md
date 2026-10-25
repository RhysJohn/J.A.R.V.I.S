---
title: Layers
type: architecture
status: active
updated: 2026-10-25
sources: [docs/decisions/0001-one-nuxt-app-with-a-layer-per-domain.md]
---

# Layers

The app in `src/app` is one Nuxt app split into **Nuxt layers**, one per domain. Nuxt auto-registers every folder in `src/app/layers/`. Each layer has the normal Nuxt structure, and its pages, components, composables, utils and API routes are auto-imported and registered as if they were in the root app. The decision is recorded in [ADR 0001](../../decisions/0001-one-nuxt-app-with-a-layer-per-domain.md).

## Layout

```
src/app/
  nuxt.config.ts        modules (@nuxt/ui, nuxt-auth-utils) + global CSS only
  app/                  app.vue, assets/css/main.css
  server/database/      shared Drizzle client, composed schema, migrations, seed
  layers/
    core/               auth, household, settings, layout + nav, dashboard, helpers
    finance/            budget, pension, mortgages
    <domain>/           house, meals, … as they are built
```

Each layer contains:

```
layers/<name>/
  nuxt.config.ts                   (usually empty)
  app/app.config.ts                nav links
  app/pages|components|composables|utils/
  server/api/<name>/               API routes
  server/database/schema/          Drizzle tables + index.ts
  shared/schemas/                  zod schemas used by client and server
```

## Dependency rules

- Feature layers **may** depend on core.
- Core **must not** depend on a feature layer.
- Feature layers **should not** depend on each other. Link across domains by ID and API (for example, a renovation project referencing finance transactions). If a concept is genuinely shared, move it into core.

## Imports

- Across layers, use named aliases: `#layers/core/...`, `#layers/finance/...`.
- On the server, import the database client from `~~/server/database` and tables from `~~/server/database/schema`.
- In **Drizzle schema files**, use relative imports only. See [database](database.md).

## Nav

Each layer adds links in `app/app.config.ts`:

```ts
export default defineAppConfig({
  nav: [{ label: 'Budget', to: '/budget', order: 100 }]
})
```

Nuxt concatenates the `nav` arrays from all layers, and `layers/core/app/layouts/default.vue` sorts them by `order`. Core uses 0 (Dashboard) and 1000 (Settings), and finance uses the 100s. Give each new layer its own hundred.

## Related

- [Adding a layer](../conventions/adding-a-layer.md)
- [Database](database.md)
- [Core](../domains/core.md)
