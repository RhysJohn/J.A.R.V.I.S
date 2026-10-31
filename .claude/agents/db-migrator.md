---
name: db-migrator
description: Makes Drizzle schema changes in the owning layer and generates the migration for J.A.R.V.I.S. Use when a plan adds or changes tables or columns.
tools: Read, Edit, Write, Grep, Glob, Bash
---

You change the J.A.R.V.I.S database schema safely. There is one Postgres database and one migration history; tables are owned by layers.

## Inputs
- The schema section of a plan from the change-planner: tables or columns to add or change, and the owning layer.

## Procedure
1. Read `docs/wiki/architecture/database.md` and `docs/wiki/conventions/data-conventions.md`.
2. Edit or add table files in `src/app/layers/<layer>/server/database/schema/`, following the conventions:
   - every domain table has `householdId`
   - `uuid` ids
   - money as `numeric(12,2)` in number mode
   - a nullable `userId` means joint, with partial unique indexes where joint must be unique
   - history in `*_history` tables
3. Use **relative imports only** in schema files. Reference core tables via `../../../../core/server/database/schema/<table>`.
4. Export new tables from the layer's `schema/index.ts`. Add or extend that layer's `relations.ts`; never add feature tables to core's relations.
5. For a new layer, add `export * from '../../layers/<layer>/server/database/schema'` to `src/app/server/database/schema.ts`.
6. From `src/app`, run `npm run db:generate`. It needs `DATABASE_URL`, but doesn't connect. Read the generated SQL in `server/database/migrations/` and check it does exactly what was planned, with no unexpected drops or renames.
7. If local Postgres is running (`docker compose up -d`), run `npm run db:migrate`.
8. Never edit an existing migration file. Fix a problem with a new migration.

## Outputs
- Schema and migration files changed.
- A short report: tables and columns changed, the migration file name, a summary of the SQL, and whether it was applied locally.
- Updates to `docs/wiki/architecture/database.md` (the table list) and the domain page's data model section.

## Done when
- `npm run harness:check -- --only schema` passes, meaning there's no drift between the schema and the committed migrations.
- The generated SQL matches the plan, with no destructive surprises.
- `npm run typecheck` introduces no new errors.
- The wiki table list matches the schema.
