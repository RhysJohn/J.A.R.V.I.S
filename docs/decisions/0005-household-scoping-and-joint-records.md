# 0005 — Household scoping on every table; nullable user means joint

- **Status:** accepted
- **Date:** 2026-06 (recorded 2026-10-25)
- **Deciders:** user + agent

## Context

All data belongs to a household. Some records are personal (income, pension) and some are shared (rent, a joint mortgage), and the budget needs both combined and per-person views. Every query must be impossible to point at another household's rows by guessing an id.

## Decision

- **Every domain table has its own `householdId` FK**, even when the household is reachable through a user or parent row. Scoping is then one indexed filter.
- **Every handler** calls `requireHouseholdSession` and filters every query with `householdScope(table.householdId, householdId)`. Inserts take `householdId` from the session, never from the body. Updates and deletes match by id **and** household, and return 404 if nothing matches.
- **A nullable FK to `users` means joint** (household-level), and non-null means attributed to that person. Examples are `budget_entries.userId` and `mortgages.holderUserId`. Always-personal records use a non-null `userId`.
- Uniqueness that must treat "joint" as one value uses **two partial unique indexes** (`userId is not null` / `userId is null`), because a plain UNIQUE treats every NULL as distinct.
- Money is `numeric(12,2)` in number mode. The currency is stored per household (default GBP).

## Alternatives considered

- **Scoping only through `userId`:** joins on every query, and joint records would have no owner.
- **Postgres row-level security:** strong, but awkward with a pooled connection and sealed-cookie sessions. The single `householdScope` helper is greppable and easy to review.
- **A separate "joint" pseudo-user:** this avoids NULLs, but it's a fake account that every query and UI would have to special-case.
- **Floats for money:** rounding errors.

## Consequences

- Every new table and handler must follow this. The change-reviewer checks it as a security item.
- Revisit if the app ever hosts more than one household.

## Related

- [Data conventions](../wiki/conventions/data-conventions.md)
- [Database](../wiki/architecture/database.md)
- [0004](0004-seeded-household-accounts-no-signup.md)
