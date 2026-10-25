# 0004 — Seeded household accounts, no public sign-up

- **Status:** accepted
- **Date:** 2026-06 (recorded 2026-10-25)
- **Deciders:** user

## Context

Exactly two known people use the app: the user and their partner. Each needs their own login so records can be attributed to a person, while both see the shared household data. The app is on the public internet, so any sign-up form is an attack surface.

## Decision

- Each partner has a separate email + password login, and both belong to one **household**.
- **There is no registration endpoint.** A one-off seed script (`npm run db:seed`) creates the household, both users and the default categories from `.env` values. It refuses to run if a household already exists.
- `/login` is the only route reachable without a session. Every other page is guarded server-side by global middleware, and every API handler by `requireHouseholdSession`.
- Seeded users change their temporary password on first login (`/settings`).

## Alternatives considered

- **Open sign-up with an invite/join flow:** unnecessary for a fixed membership of two, and it adds attack surface.
- **A single shared login:** this would lose per-person attribution (income, pensions, who holds a mortgage).
- **OAuth (for example Google):** convenient, but it adds provider setup and callback handling for no real gain at two users. Reconsider if password management becomes a pain.

## Consequences

- Adding a person means changing the seed script or the database by hand. This is acceptable while membership is fixed.
- Real credentials exist only in the gitignored `src/app/.env`.
- Revisit if more people (family, a lodger) ever need access.

## Related

- [Auth and households](../wiki/architecture/auth-and-households.md)
- [0005: household scoping](0005-household-scoping-and-joint-records.md)
