---
title: Data conventions
type: convention
status: active
updated: 2026-10-25
sources: [docs/raw/2026-06-finance-tracker-plan.md]
---

# Data conventions

The rules every table and API route follows.

## Household scoping (security boundary)

- Every domain table has its own `householdId` FK to `households`, even when it's also reachable through a user or parent row. Scoping is then a single indexed filter.
- Every API handler starts with `const { householdId, userId } = await requireHouseholdSession(event)`.
- Every select, update and delete filters with `householdScope(table.householdId, householdId)`. Updates and deletes by id combine both: `and(eq(table.id, id), householdScope(table.householdId, householdId))`. Return 404 if nothing matches.
- Inserts set `householdId` from the session, never from the request body.

## Person vs joint

A **nullable** FK to `users` means the record is joint (household-level). A non-null value attributes it to that person. Examples are `budget_entries.userId` and `mortgages.holderUserId`. Records that are always personal, such as income and pensions, use a non-null `userId`.

When a uniqueness rule has to treat "joint" as one value, use two partial unique indexes: one `where userId is not null` and one `where userId is null`. A plain UNIQUE constraint treats every NULL as distinct. See `budget_entries` in `layers/finance/server/database/schema/budget.ts`.

## Types

| Kind | Column type |
|---|---|
| IDs | `uuid` with `defaultRandom()` |
| Money | `numeric(12, 2)` with `mode: 'number'` |
| Percentages | `numeric(5, 2)` |
| Interest rates | `numeric(5, 3)` |
| Months | `date` holding the first of the month (`YYYY-MM-01`), validated by `monthSchema`; helpers in `layers/core/app/utils/month.ts` |
| Point-in-time history | a separate `*_history` table with a date and a value |
| Timestamps | `timestamp with time zone`, `createdAt` default now |
| Soft delete | an `isArchived` boolean, where history must stay intact (for example categories) |

The currency is stored per household (default `GBP`). Format it with `formatCurrency` from `layers/core/app/utils/currency.ts`.

## Validation and errors

- zod schemas live in `layers/<name>/shared/schemas/` and are shared by `UForm` and `readValidatedBody` / `getValidatedQuery`.
- A unique violation (Postgres code `23505`) maps to a 409 with a human-readable message.

## Related

- [Database](../architecture/database.md)
- [Auth and households](../architecture/auth-and-households.md)
