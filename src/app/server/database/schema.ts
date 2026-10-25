// Every layer owns its own tables; this composes them into the single schema used by the
// shared Drizzle client, the seed script and drizzle-kit (one Postgres, one migration history).
// Relative imports only — drizzle-kit and tsx run outside Nuxt, so `~~`/`#layers` aliases don't resolve.
export * from '../../layers/core/server/database/schema'
export * from '../../layers/finance/server/database/schema'
