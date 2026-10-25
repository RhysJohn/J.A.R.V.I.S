---
title: Index
type: overview
status: active
updated: 2026-10-25
sources: []
---

# Wiki index

The catalogue of every wiki page. Agents read this first. Every page must be listed here, and an unlisted page is an orphan that `lint` reports. Rules for maintaining the wiki are in [AGENTS.md](../../AGENTS.md).

## Start here

- [Overview](overview.md): what J.A.R.V.I.S is, the domains and their status, principles
- [Roadmap](roadmap.md): done, next in order, known issues
- [Log](log.md): append-only history of ingests, changes, decisions and lints

## Architecture

- [Harness](architecture/harness.md): the agent harness around the app, and the planned loop and graph workflows *(planned)*
- [Validation hooks](architecture/validation-hooks.md): after-edit related tests and presentation guard; full suite before an agent stops
- [Stack](architecture/stack.md): technology choices and why
- [Layers](architecture/layers.md): one Nuxt layer per domain, dependency rules, imports, nav
- [Database](architecture/database.md): one Postgres, composed Drizzle schema, relations, table list
- [Auth and households](architecture/auth-and-households.md): seeded accounts, sessions, route and API guards
- [Deployment](architecture/deployment.md): Azure plan and open questions *(planned)*

## Conventions

- [Change workflow](conventions/change-workflow.md): interim step-by-step procedure and review checklist
- [Data conventions](conventions/data-conventions.md): household scoping, person vs joint, column types, validation
- [Frontend architecture](conventions/frontend-architecture.md): logic, composables and presentation-only components, and how each is tested
- [Adding a layer](conventions/adding-a-layer.md): checklist for a new domain

## Domains

- [Core](domains/core.md): login, household, settings, shell, dashboard *(active)*
- [Finance](domains/finance.md): budget, income, pension, mortgages, statement import *(active)*
- [House](domains/house.md): renovation projects, progress, spend *(planned)*
- [Meals](domains/meals.md): meal library, weekly plan, shopping list *(planned)*
- [Planner](domains/planner.md): shared todos and calendar *(idea)*
- [Home](domains/home.md): energy and smart home *(idea)*

## Integrations

- [Open Banking](integrations/open-banking.md): live bank feeds *(idea)*
- [Energy](integrations/energy.md): Octopus API, Glowmarkt/Bright *(idea)*
- [Home Assistant](integrations/home-assistant.md): smart-home hub and reachability *(idea)*
- [Supermarket](integrations/supermarket.md): getting the shopping list into Tesco *(idea)*

## Decisions (ADRs)

- [0001: One Nuxt app, one layer per domain](../decisions/0001-one-nuxt-app-with-a-layer-per-domain.md)
- [0002: Presentation-only components, enforced by validation hooks](../decisions/0002-presentation-only-components-with-validation-hooks.md)

## Raw sources

See [docs/raw/README.md](../raw/README.md).
