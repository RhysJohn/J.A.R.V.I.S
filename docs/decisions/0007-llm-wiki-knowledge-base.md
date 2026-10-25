# 0007 — Project knowledge as an LLM-maintained wiki, with AGENTS.md as the contract

- **Status:** accepted
- **Date:** 2026-10-25
- **Deciders:** user

## Context

Most development will be done by agents inside a harness that the user is designing (see the [harness goal](../raw/2026-10-25-harness-goal.md)). Agents start each session with no memory, so project knowledge must live in the repo in a form they can navigate, trust and keep current. A single large CLAUDE.md doesn't scale across many domains, and it mixes rules with facts.

## Decision

Follow the "LLM wiki" pattern, with three layers:
- **`docs/raw/`**: immutable sources (plans, the user's own words, scrubbed samples). These are added, never edited.
- **`docs/wiki/`**: compiled, interlinked pages maintained by agents. Each page has frontmatter (`type`, `status`, `updated`, `sources`), and the wiki has an `index.md` catalogue and an append-only `log.md`.
- **The schema:** `AGENTS.md` is the operating contract, with CLAUDE.md importing it so every tool reads the same rules. The schema also includes the agent files.

The wiki operations are **ingest**, **query** and **lint**. Every change ends with a wiki update and a log entry. Decisions go in `docs/decisions/` ([0011](0011-adrs-required-by-the-workflow.md)). The code is the source of truth for behaviour, and the wiki for intent, structure and status.

## Alternatives considered

- **A single large CLAUDE.md:** grows without bound and mixes rules with facts, with no index or provenance.
- **A docs site or an external tool (Notion, Confluence):** not in the repo, so agents can't update it in the same commit as the code.
- **Relying on the code knowledge graph (graphify) alone:** good for code structure, but it can't hold intent, roadmap or decisions. It's kept as an optional tool alongside the wiki.

## Consequences

- Every change carries a wiki cost. The change-reviewer and the wiki-librarian's lint keep the wiki honest.
- Relative markdown links make the wiki readable on GitHub and in Obsidian.
- Revisit if the wiki drifts from the code faster than lint catches it.

## Related

- [AGENTS.md](../../AGENTS.md)
- [Wiki index](../wiki/index.md)
- [Harness](../wiki/architecture/harness.md)
