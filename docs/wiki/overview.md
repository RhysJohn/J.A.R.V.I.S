---
title: Overview
type: overview
status: active
updated: 2026-10-25
sources: [docs/raw/2026-10-25-jarvis-vision.md, docs/raw/2026-06-finance-tracker-plan.md]
---

# J.A.R.V.I.S overview

J.A.R.V.I.S is a private web app for one household: the user and their partner, who have just bought a house. Each of them has their own login, and the app is hosted in the cloud so both can use it from any device. It replaces a budgeting spreadsheet and grows into an assistant for running the home.

## Domains

| Domain | Status | What it covers | Page |
|---|---|---|---|
| Core | active | Login, household, settings, app shell, dashboard | [core](domains/core.md) |
| Finance | active | Budget (50/30/20), pension, mortgages/loans, statement import (plan vs actual) | [finance](domains/finance.md) |
| House | planned | Renovation projects (kitchen, bathroom, garden): budget, tasks, progress, photos | [house](domains/house.md) |
| Meals | planned | Meals you both like, weekly plan, shopping list for the supermarket | [meals](domains/meals.md) |
| Planner | idea | Shared todos and calendar | [planner](domains/planner.md) |
| Home | idea | Energy usage and bills, smart lights and temperature | [home](domains/home.md) |

## Guiding principles

- **Two known users, one household.** No public sign-up. Data is shared across the household and attributed to a person where that matters.
- **Manual first, integrations later.** Every feature works with manual entry or file import before any live integration is added (Open Banking, energy APIs, Home Assistant).
- **One app, one layer per domain**, so domains share auth and data without tangling. See [layers](architecture/layers.md).
- **Cheap to run.** Scale-to-zero hosting, and free tiers and APIs where possible.

## Related

- [Roadmap](roadmap.md)
- [Stack](architecture/stack.md)
- [Index](index.md)
