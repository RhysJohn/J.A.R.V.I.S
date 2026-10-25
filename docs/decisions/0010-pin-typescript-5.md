# 0010 — Pin TypeScript 5 for vue-tsc

- **Status:** accepted
- **Date:** 2026-10-25
- **Deciders:** agent (to make the typecheck gate runnable)

## Context

`npm run typecheck` (Nuxt's `vue-tsc`) is a harness gate. Installing `typescript` without a version pulled TypeScript 7. `vue-tsc` 3 can't load it: it fails with `ERR_PACKAGE_PATH_NOT_EXPORTED` for `typescript/lib/tsc`, so the gate couldn't run at all.

## Decision

Pin `typescript` to `^5` in `src/app` devDependencies, alongside `vue-tsc` `^3`.

## Alternatives considered

- **Drop typecheck as a gate:** this loses the only static check on Vue templates.
- **Use TypeScript 7's native checker directly:** it doesn't understand `.vue` single-file components.

## Consequences

- Typecheck runs. It currently has 4 known errors in `server/database/seed.ts`, so the gate is "no new errors".
- **Revisit** when `vue-tsc` supports TypeScript 7: bump both, then rerun typecheck.

## Related

- [Stack](../wiki/architecture/stack.md)
- [Roadmap: known issues](../wiki/roadmap.md#known-issues)
