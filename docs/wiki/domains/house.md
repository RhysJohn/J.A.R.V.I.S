---
title: House
type: domain
status: planned
updated: 2026-10-25
sources: [docs/raw/2026-10-25-jarvis-vision.md]
---

# House

**Planned layer `house`.** The household has just bought a house and is planning renovations of the kitchen, the bathroom and the garden. This domain extends finance to home projects, with a view of the progress of each.

## Scope (draft)

- **Projects:** for example "Kitchen renovation". Each has a status (idea → planning → in progress → done), a target budget and dates.
- **Budget lines** per project: estimated vs quoted vs actual. Quotes from tradespeople can be attached.
- **Actual spend** comes from [finance](finance.md) transactions tagged to a project or budget line. The house layer stores the transaction IDs, so finance doesn't depend on house.
- **Tasks / milestones** per project with a completion state, giving a progress percentage.
- **Photos** (before, during and after) and documents. These need file storage (for example Azure Blob Storage), to be decided.
- A **progress view** across all projects: budget used, tasks done, timeline.

## Open questions

- Where to store files, and the size limits.
- Whether rooms are a separate entity (several projects per room) or projects are enough.
- The design of the link to finance transactions, which depends on statement import being built.

## Related

- [Finance](finance.md)
- [Adding a layer](../conventions/adding-a-layer.md)
- [Roadmap](../roadmap.md)
