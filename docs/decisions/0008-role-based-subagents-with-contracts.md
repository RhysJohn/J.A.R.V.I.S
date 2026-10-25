# 0008 — Role-based subagents with input/output/done contracts

- **Status:** accepted
- **Date:** 2026-10-25
- **Deciders:** user + agent

## Context

The user wants agent files that make the changes, and will design loop engineering (implementation) and graph engineering (the end-to-end cycle) around them. Nodes in a graph need predictable inputs and outputs, and a loop needs a clear exit condition.

## Decision

- Subagents live in `.claude/agents/` and are split by **role**, not by domain:
  - change-planner (read-only)
  - db-migrator
  - layer-developer
  - change-reviewer (read-only)
  - wiki-librarian
  - decision-recorder (added by [0011](0011-adrs-required-by-the-workflow.md))
- **Domain knowledge comes from the wiki**, so the same agents serve every layer.
- Every agent file declares **Inputs**, **Outputs** and **Done when**. "Done when" is written to be checkable, so it can serve as a loop's exit condition. The validation hooks ([0002](0002-presentation-only-components-with-validation-hooks.md)) enforce the machine-checkable parts.
- The main agent orchestrates and owns commits. The current sequence is an interim default until the user's designed workflow replaces it.

## Alternatives considered

- **Per-domain agents** (finance-agent, house-agent): these duplicate the conventions in every file and drift as domains grow.
- **One general agent with a long prompt:** no clean nodes for a graph, and review would be self-review.

## Consequences

- Adding a domain needs wiki pages, not new agents.
- Adding or changing a role means updating AGENTS.md's agent table and the change workflow.
- Revisit when the user's loop and graph designs are ingested; they may merge or split roles.

## Related

- [AGENTS.md](../../AGENTS.md#subagents)
- [Harness](../wiki/architecture/harness.md)
- [Change workflow](../wiki/conventions/change-workflow.md)
