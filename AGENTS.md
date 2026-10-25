# AGENTS.md — how agents work in J.A.R.V.I.S

This file is the operating contract for every AI agent working in this repo (Claude Code and its subagents, or any other tool that reads `AGENTS.md`). It is short on purpose: **knowledge lives in the wiki, and this file tells you how to use and maintain it.**

J.A.R.V.I.S is a private household assistant for two people: finance, house renovation, meals, todos/calendar, energy and smart home. It's a Nuxt 4 app in `src/app` with one layer per domain. Start at [docs/wiki/overview.md](docs/wiki/overview.md).

This file, the wiki and the subagents together form the **harness** around the app. The user is designing its loop (implementation) and graph (end-to-end cycle) workflows. See [docs/wiki/architecture/harness.md](docs/wiki/architecture/harness.md).

## The three layers of knowledge

This follows the "LLM wiki" pattern: raw sources are compiled by agents into a maintained, interlinked wiki.

| Layer | Where | Who writes it | Rules |
|---|---|---|---|
| **Raw sources** | `docs/raw/` | Humans (or agents copying in material verbatim) | **Immutable.** Never edit or delete; add new files only. Name them `YYYY-MM[-DD]-<slug>.md`. |
| **Wiki** | `docs/wiki/` | Agents | The compiled, current truth about the project. Agents create and update pages; humans may edit too. |
| **Schema** | `AGENTS.md` (this file), `.claude/agents/*.md` | Humans, with agent proposals | How agents behave. Change only when the user asks or agrees. |

Architecture decisions are recorded as ADRs in `docs/decisions/` (numbered, never rewritten; supersede with a new ADR). The wiki links to them.

**The code is the source of truth for behaviour; the wiki is the source of truth for intent, structure and status.** If they disagree, check the code, fix whichever is wrong, and log it.

## Before you change anything

1. Read [docs/wiki/index.md](docs/wiki/index.md) and open the pages relevant to the task: at minimum the domain page, plus any architecture or convention pages it links to.
2. Read [docs/wiki/conventions/change-workflow.md](docs/wiki/conventions/change-workflow.md). It is the step-by-step procedure for code changes.
3. Skim the latest entries in [docs/wiki/log.md](docs/wiki/log.md) for recent context.

## Every change ends with a wiki update

A change isn't done until the wiki reflects it. In the same commit as the code:

- Update every wiki page whose facts changed: routes, tables, status, conventions, roadmap.
- Bump `updated:` in the frontmatter of each page you touch.
- Add any new page to `index.md`.
- Append one entry to `log.md` (format below). Never edit past entries.

## Wiki operations

These are the three things agents do with the wiki. The [wiki-librarian](.claude/agents/wiki-librarian.md) subagent specialises in them.

- **Ingest:** a new file lands in `docs/raw/`, such as a bank CSV header sample, a design note, or a quote for the kitchen. Read it, then update or create the wiki pages it affects, cite it in their `sources:`, update `index.md`, and log it. A single source often touches several pages.
- **Query:** answer a question from the wiki (index first, then pages), citing pages. If the answer was worth working out, offer to file it as a new page.
- **Lint:** health-check the wiki for broken links, orphan pages missing from `index.md`, stale `status`, contradictions between pages, contradictions between the wiki and the code (routes, tables, files that moved), and missing cross-links. Fix the mechanical issues and report the judgement calls.

## Page format

Every wiki page starts with frontmatter:

```yaml
---
title: Finance
type: domain            # overview | architecture | convention | domain | integration | roadmap
status: active          # active | planned | idea | deprecated
updated: 2026-10-25
sources: [docs/raw/2026-06-finance-tracker-plan.md]
---
```

Then a one-paragraph summary, the body, and a final `## Related` section of links. Use **relative markdown links** (`[Layers](../architecture/layers.md)`) so they work on GitHub and in Obsidian. One concept per page; split a page when it grows past roughly 150 lines.

## Log format

`docs/wiki/log.md` is append-only, newest at the bottom:

```
## [2026-10-25] change | Restructure into Nuxt layers
- What: …
- Pages: architecture/layers.md, domains/finance.md
- Commit/PR: …
```

The kind is one of `ingest`, `change`, `decision`, `lint` or `query`.

## Subagents

Role-based subagents live in `.claude/agents/`. Domain knowledge comes from the wiki, not the agent file, so the same agents work for every layer.

| Agent | Use it to |
|---|---|
| [change-planner](.claude/agents/change-planner.md) | Turn a request into a concrete plan grounded in the wiki and code (read-only) |
| [layer-developer](.claude/agents/layer-developer.md) | Implement a planned change inside a layer, verify it, update the wiki |
| [db-migrator](.claude/agents/db-migrator.md) | Make Drizzle schema changes and generate migrations safely |
| [change-reviewer](.claude/agents/change-reviewer.md) | Review a diff against the conventions and check the wiki was updated (read-only) |
| [wiki-librarian](.claude/agents/wiki-librarian.md) | Ingest raw sources, answer questions from the wiki, lint it |

Each agent file declares its **Inputs**, **Outputs** and **Done when**, so it can be used as a node in a workflow graph, with its "done when" serving as a loop's exit condition.

Until the designed workflow exists, the interim flow for a feature is: change-planner → db-migrator (if tables change) → layer-developer → change-reviewer. The main agent orchestrates and owns the commit.

## Hard rules

- Never commit secrets. Real credentials live only in `src/app/.env` (gitignored). Never put personal financial data (statements, account numbers) in `docs/raw/` or anywhere else in git; use scrubbed header-only samples.
- Every API handler scopes by household. See [data conventions](docs/wiki/conventions/data-conventions.md).
- Core never imports from a feature layer, and feature layers don't import from each other. See [layers](docs/wiki/architecture/layers.md).
- Commit or push only when the user asks.

## Tooling

- Run npm commands from `src/app`: `npm run dev`, `npm run typecheck`, `npm run build`, `npm run db:generate`, `npm run db:migrate`.
- **graphify** (optional code graph): if `graphify-out/graph.json` exists, use `graphify query "<question>"`, `graphify path "<A>" "<B>"` or `graphify explain "<concept>"` before broad grepping, and run `graphify update .` after code changes. When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` first.
