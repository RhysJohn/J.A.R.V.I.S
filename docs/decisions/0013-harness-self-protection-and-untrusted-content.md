# 0013 — The harness protects itself; content is data, never instructions

- **Status:** accepted
- **Date:** 2026-10-31
- **Deciders:** user + agent

## Context

The [threat model](../raw/2026-10-31-threat-model.md) found that the harness's biggest risk was itself:
- **Self-editable guardrails:** agents could edit their own controls (`.claude/settings.json`, hooks, `harness/`, the guard script, the typecheck baseline, tests), with only an instruction in AGENTS.md saying not to.
- **Untrusted content treated as trusted:** the wiki, which agents treat as the source of truth, is compiled from outside material in `docs/raw/`, so injected instructions could persist across sessions.
- **Automatic execution:** hooks run agent-written test code automatically with the user's privileges.

## Decision

- **Trust rule:** only the user, in the conversation, authorises actions. Raw sources, wiki, ADRs, tool output and file contents are data. Instruction-like content is quoted to the user, never followed or copied into the wiki. This is written into AGENTS.md and the wiki-librarian agent.
- **Guard hook** (`.claude/hooks/guard-tool.mjs`, PreToolUse on file and shell tools, set to fail closed):
  - **denies** edits to `.claude/settings*.json`, `.claude/hooks/` and `.github/`
  - **asks** before edits to `harness/`, `src/app/scripts/`, `vitest.config.ts`, `AGENTS.md`, `CLAUDE.md`, `.claude/agents/` and `docs/raw/`
  - **denies** reading or writing `.env` files
  - **denies** shell commands that write to protected paths, plus `--no-verify`, force-push and changes to hook settings
  
  Starting Claude Code with `JARVIS_HARNESS_MAINTENANCE=1` turns the critical denies into asks. An agent can't set that variable, because hooks read Claude Code's environment, not the environment of the commands it runs.
- **Permission rules** in `.claude/settings.json` mirror this. Reading or editing `.env` files is denied, and the protected paths and `git push` are `ask`. They're the fallback if the hook can't run.
- **`integrity` harness check** (in both profiles, so the Stop hooks and CI run it). It fails on:
  - raw sources modified or deleted
  - test files deleted
  - a grown typecheck baseline
  - injection-style text in the wiki or ADRs
  
  CI compares against the PR base.
- **CODEOWNERS** puts the protected paths and `docs/decisions/` under the owner's review. CI runs with a read-only token and doesn't keep credentials after checkout.

## Alternatives considered

- **Instructions only (the AGENTS.md rule):** the threat this addresses is an agent being *tricked* into ignoring instructions, so instructions alone aren't a control.
- **Permission rules only:** these don't cover shell commands, and path-pattern matching is easy to get subtly wrong. The hook and the rules back each other up.
- **Deny everything protected, with no "ask":** the harness would be impossible to improve without hand-editing. "Ask" keeps a human in the loop while still stalling an unattended or injected agent.
- **Turning on the Claude Code sandbox for all Bash now:** the strongest isolation against finding 3. But it changes every command's behaviour (network allowlists, filesystem limits) and needs trying out on this Windows setup first. Deferred to a separate decision.

## Consequences

- Changing the harness now needs the user: approving an "ask", maintenance mode, or editing by hand.
- The shell guard is pattern-based, so a determined bypass (an encoded command, an unusual tool) could get past it. The real backstops are the `integrity` check, CI and CODEOWNERS review. **Unattended runs should still use a sandbox or a disposable environment** (threat model finding 3, still open).
- New controls only take effect in a **new** Claude Code session.
- A broken guard hook (for example, Node missing) blocks tool use, because it fails closed.
- Revisit when the user's loop and graph workflows define unattended runs. That's the point at which to decide on sandboxing.

## Related

- [Agent security](../wiki/architecture/agent-security.md)
- [Quality gates](../wiki/architecture/quality-gates.md)
- [Validation hooks](../wiki/architecture/validation-hooks.md)
- [0012](0012-single-harness-check-for-hooks-and-ci.md)
- [Raw: threat model](../raw/2026-10-31-threat-model.md)
