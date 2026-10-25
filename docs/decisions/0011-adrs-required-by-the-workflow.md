# 0011 — ADRs are a required output of the change workflow

- **Status:** accepted
- **Date:** 2026-10-25
- **Deciders:** user

## Context

Decisions were being made in conversation and recorded only partly: as prose in wiki pages, or not at all. The wiki says what *is*, but later work also needs to know *why*, and what was rejected. Without that, an agent may undo a deliberate choice or re-litigate one that's already settled. The user asked for the workflow itself to produce ADRs in `docs/decisions/`.

## Decision

- Every change that makes or relies on a significant decision produces an ADR in `docs/decisions/`, following the criteria and template in [the decisions README](README.md).
- **In the workflow:**
  - **change-planner** lists the decisions in its plan, marking each as already decided (link the ADR), decided now (needs a new ADR) or for the user to decide (needs a `proposed` ADR).
  - **decision-recorder** writes or updates the ADRs, the index and the wiki links.
  - **change-reviewer** blocks the change if a decision in the diff has no ADR.
  - **wiki-librarian lint** checks ADR links, the index and frontmatter `sources`.
- ADRs are immutable once accepted; a change of mind means a new ADR that supersedes the old one.
- Decisions made before this rule were backfilled as 0003–0010.

## Alternatives considered

- **Record decisions in wiki pages only:** the current state overwrites the reasoning, and rejected options are lost.
- **Leave ADRs to human judgement:** in practice they don't get written. Making them a workflow output gives each one an owner (decision-recorder) and a check (change-reviewer).
- **A hook that blocks commits without an ADR:** whether a change contains a decision is a judgement call, not something a script can detect. The reviewer step fits that better.

## Consequences

- Planning has to name decisions explicitly, which also surfaces the ones that need the user before work starts.
- A small cost per significant change: one short file and an index line.
- Revisit if ADR volume becomes noise. If so, tighten the criteria rather than skipping records.

## Related

- [Decisions README](README.md)
- [Change workflow](../wiki/conventions/change-workflow.md)
- [0007: LLM wiki](0007-llm-wiki-knowledge-base.md)
- [0008: role-based subagents](0008-role-based-subagents-with-contracts.md)
