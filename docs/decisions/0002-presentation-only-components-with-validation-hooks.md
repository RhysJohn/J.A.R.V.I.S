# 0002 — Presentation-only components, enforced by validation hooks

- **Status:** accepted
- **Date:** 2026-10-25

## Context

Agents will make most changes to J.A.R.V.I.S, inside a harness whose loops need fast, reliable signals. The budget components contained real business rules: the 50/30/20 deltas, totals, edit rules and form validation. Rules inside `.vue` files can only be tested by mounting components, which is slow and tests the rule indirectly, and there were no tests at all.

## Decision

- Business logic lives in `app/logic/` per layer, as pure TypeScript with no Vue or Nuxt. It's covered by **unit tests** in a plain-Node Vitest project.
- Components, pages and layouts are **presentation-only**: they render props, emit events and hold UI state. They're covered by **component tests** in a Nuxt-runtime Vitest project. Data access goes through composables.
- Tests are colocated as `<name>.test.ts`.
- Claude Code hooks enforce this:
  - After each edit, a hook runs the presentation guard and `vitest related` for the changed file. Logic files run the unit project; `.vue` files and composables run the component project.
  - Stop and SubagentStop hooks run the full suite over uncommitted changes, and block finishing on failure.

## Alternatives considered

- **Only test components:** this covers rules indirectly and slowly (Nuxt start-up per run), and a failure doesn't say which rule broke.
- **A lint rule (ESLint) instead of the guard script:** more precise, but it adds an ESLint setup the project doesn't otherwise have. The regex guard is simple, fast and good enough. Revisit if it produces false positives.
- **Running the whole suite after every edit:** simpler, but slower as the suite grows. `related` keeps per-edit feedback proportional to the change, and the Stop hook still runs everything once.

## Consequences

- New features need a logic module plus unit tests and a component test. The hook nudges for missing tests rather than blocking.
- Component tests need some care: mocked composables, `registerEndpoint` for APIs, stubbed charts, and teleported modals.
- Hooks load at session start, need Node, and rely on Git Bash on Windows.
