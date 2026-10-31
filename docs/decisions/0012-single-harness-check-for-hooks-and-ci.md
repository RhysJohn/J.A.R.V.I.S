# 0012 — One harness check command shared by hooks, CI and humans

- **Status:** accepted
- **Date:** 2026-10-31
- **Deciders:** user + agent

## Context

A principal-level review of the harness (2026-10-31) found that the gates only ran inside Claude Code on one machine:
- there was no CI
- the wiki link checker lived in a scratch folder, outside the repo
- typecheck and build weren't run by anything automatic
- "no new typecheck errors" depended on an agent remembering the count

A commit made by a human, or by another agent tool, skipped every check, and the Stop hook duplicated logic that CI would also need.

## Decision

- **One runner:** `harness/check.mjs`, run as `npm run harness:check` from `src/app`. It's plain Node with no dependencies and no shell, so it behaves the same on Windows, Linux and CI.
- **Checks**, as one module each under `harness/checks/`: `wiki`, `adrs`, `presentation`, `schema` (drift against committed migrations, via a scratch copy, with no database needed), `tests`, `typecheck` (against `harness/typecheck-baseline.json`, matched on file, code and message) and `build`.
- **Profiles:**
  - `fast` (wiki, adrs, presentation, schema, tests): about 15s, run by the Stop and SubagentStop hooks
  - `full` (adds typecheck and build): run by CI, and before merging
- **Machine-readable output:** `--json` and `--report <file>`, for hooks, CI artifacts and the planned workflow graph.
- **Shared code:** the hooks import their shared code from `harness/lib.mjs` and delegate to the runner rather than reimplementing checks.
- **CI:** `.github/workflows/harness.yml` runs the `full` profile on pushes to `main` and on every pull request, and uploads the JSON report.
- **The typecheck baseline may only shrink.** `--update-baseline` rewrites it, and a change that grows it needs a reason in review.

## Alternatives considered

- **Separate npm scripts chained with `&&`:** stops at the first failure, gives no structured report, and the hooks would still need their own logic.
- **Lefthook or Husky git hooks:** these also catch human commits, but they're easy to bypass (`--no-verify`) and don't help CI or agents. They could be added later, calling the same runner.
- **Turborepo or Nx task graph:** too much machinery for a single app. The profiles cover the speed and coverage trade-off.
- **Matching typecheck errors by line number:** unrelated edits shift lines and create false "new" errors.

## Consequences

- The gates are identical everywhere. Adding a gate means adding one module to `harness/checks/` and choosing its profiles.
- **CI on its own doesn't block merging:** branch protection on `main` must also require the `harness` check, and that's a GitHub setting for the user to turn on.
- Stop hooks now run the wiki, ADR and schema checks too, so they also fire for docs-only changes.
- Revisit the profiles if `fast` grows past about 30s. If so, split tests by relevance (per the review's finding 4).

## Related

- [Quality gates](../wiki/architecture/quality-gates.md)
- [Validation hooks](../wiki/architecture/validation-hooks.md)
- [Harness](../wiki/architecture/harness.md)
- [0002](0002-presentation-only-components-with-validation-hooks.md)
- [0011](0011-adrs-required-by-the-workflow.md)
