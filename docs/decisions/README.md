# Architecture decision records (ADRs)

Every significant decision about J.A.R.V.I.S is recorded here as a numbered ADR, so later work (human or agent) can find out **what** was decided, **why**, and **what was rejected**. Wiki pages describe the current state and link here for the reasoning.

ADRs are a required output of the [change workflow](../wiki/conventions/change-workflow.md). The change-planner lists the decisions a change involves, the [decision-recorder](../../.claude/agents/decision-recorder.md) agent writes them up, and the change-reviewer checks they exist.

## When a decision needs an ADR

Write one when a change makes, or relies on, a choice that is:

- **Between real alternatives**: a library, a service, a pattern, a data shape.
- **Lasting**: hard to reverse, or other work will build on it.
- **Cross-cutting**: it sets a convention that other layers or agents must follow.
- **A deliberate limitation**: something knowingly not done (or not yet), and why.

Typical examples:
- picking a technology or provider
- a data-model or security convention
- the app or repo structure
- the approach to an external integration
- a change to the harness, hooks or agent workflow
- pinning or upgrading a major dependency for a reason

**No ADR is needed** for a bug fix, or for a feature that only follows existing conventions. Link the ADRs it relies on instead.

## Rules

- **Numbering:** `NNNN-short-kebab-title.md`. Take the next free number; numbers record the order of writing, and `Date` records when the decision was made.
- **Immutable once accepted:** never rewrite the reasoning. To change a decision, write a new ADR that supersedes it. Then edit only the old ADR's `Status` line, to `superseded by [NNNN](NNNN-….md)`.
- **User-owned decisions:** if the user hasn't made the call yet, record it as `proposed` with the options. When they decide, change it to `accepted` (or `rejected`) and add the date.
- **Wiki links:** every ADR links the wiki pages it affects, and those pages link back to it in their `sources:` or body.
- **Index:** add each new ADR to the table below and to [the wiki index](../wiki/index.md#decisions-adrs), and log it in [the wiki log](../wiki/log.md) with kind `decision`.
- **Length:** keep it short. One decision per ADR.

## Template

```markdown
# NNNN — Title in a few words

- **Status:** proposed | accepted | rejected | superseded by [NNNN](NNNN-….md)
- **Date:** YYYY-MM-DD (when decided; add "recorded YYYY-MM-DD" if written later)
- **Deciders:** user | user + agent | agent (within agreed conventions)

## Context
What forced a decision: the problem, constraints and forces at play.

## Decision
What was chosen, stated so it can be followed.

## Alternatives considered
- **Option:** why it wasn't chosen.

## Consequences
What becomes easier or harder, follow-up work, and what would make us revisit this.

## Related
Wiki pages, other ADRs, raw sources.
```

## Index

| # | Decision | Status | Date |
|---|---|---|---|
| [0001](0001-one-nuxt-app-with-a-layer-per-domain.md) | One Nuxt app, one layer per domain | accepted | 2026-10-25 |
| [0002](0002-presentation-only-components-with-validation-hooks.md) | Presentation-only components, enforced by validation hooks | accepted | 2026-10-25 |
| [0003](0003-nuxt-postgres-drizzle-stack.md) | Nuxt 4 + Postgres + Drizzle stack | accepted | 2026-06 |
| [0004](0004-seeded-household-accounts-no-signup.md) | Seeded household accounts, no public sign-up | accepted | 2026-06 |
| [0005](0005-household-scoping-and-joint-records.md) | Household scoping on every table; nullable user means joint | accepted | 2026-06 |
| [0006](0006-azure-container-apps-hosting.md) | Host on Azure Container Apps + Azure Database for PostgreSQL | accepted | 2026-06 |
| [0007](0007-llm-wiki-knowledge-base.md) | Project knowledge as an LLM-maintained wiki, with AGENTS.md as the contract | accepted | 2026-10-25 |
| [0008](0008-role-based-subagents-with-contracts.md) | Role-based subagents with input/output/done contracts | accepted | 2026-10-25 |
| [0009](0009-integrations-import-first-single-hubs.md) | Integrations: manual/import first, one hub per area, no basket automation | proposed | 2026-10-25 |
| [0010](0010-pin-typescript-5.md) | Pin TypeScript 5 for vue-tsc | accepted | 2026-10-25 |
| [0011](0011-adrs-required-by-the-workflow.md) | ADRs are a required output of the change workflow | accepted | 2026-10-25 |
| [0012](0012-single-harness-check-for-hooks-and-ci.md) | One harness check command shared by hooks, CI and humans | accepted | 2026-10-31 |
| [0013](0013-harness-self-protection-and-untrusted-content.md) | The harness protects itself; content is data, never instructions | accepted | 2026-10-31 |
