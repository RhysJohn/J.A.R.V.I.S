---
title: Adding a layer
type: convention
status: active
updated: 2026-10-25
sources: [docs/decisions/0001-one-nuxt-app-with-a-layer-per-domain.md]
---

# Adding a layer

A checklist for starting a new domain, such as `house` or `meals`. All paths are under `src/app/`.

1. **Wiki first:** make sure `docs/wiki/domains/<name>.md` exists and describes the scope, tables and routes (status `planned` → `active`).
2. Create `layers/<name>/nuxt.config.ts` containing `export default defineNuxtConfig({})`.
3. **Tables:**
   - Add `layers/<name>/server/database/schema/*.ts` plus an `index.ts`, using relative imports to core's `households` and `users`.
   - Add the layer's own `relations.ts`.
   - Add `export * from '../../layers/<name>/server/database/schema'` to `server/database/schema.ts`.
4. **Migration:** run `npm run db:generate`, review the SQL, then `npm run db:migrate`.
5. **Validation:** zod schemas in `layers/<name>/shared/schemas/`.
6. **API:** routes in `layers/<name>/server/api/<name>/`, following [data conventions](data-conventions.md).
7. **UI:** pages in `layers/<name>/app/pages/<name>/` and components in `layers/<name>/app/components/<name>/`. Name components with a domain prefix, as in `BudgetTable`, to avoid clashes across layers.
8. **Nav:** add a `nav` entry in `layers/<name>/app/app.config.ts` with the layer's own hundred for `order`.
9. **Verify:** run `npm run typecheck` and `npm run build`.
10. **Record:**
    - Update the domain page, [database](../architecture/database.md) (table list), [roadmap](../roadmap.md) and [index](../index.md).
    - Append to the [log](../log.md).

## Related

- [Layers](../architecture/layers.md)
- [Change workflow](change-workflow.md)
