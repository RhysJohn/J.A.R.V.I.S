---
title: Agent security
type: architecture
status: active
updated: 2026-10-31
sources: [docs/raw/2026-10-31-threat-model.md, docs/decisions/0013-harness-self-protection-and-untrusted-content.md]
---

# Agent security

How the harness protects itself, and the developer's machine, from agents that misbehave or are tricked by injected content. It covers threat model findings 1–3 (the agent harness). The app-level findings are tracked in the [roadmap](../roadmap.md#security-backlog). The decision is [ADR 0013](../../decisions/0013-harness-self-protection-and-untrusted-content.md).

## The threats

1. **Self-modification:** an agent edits its own controls (settings, hooks, checks, the guard script, the baseline, tests) to get a change past the gates.
2. **Persistent prompt injection:** outside content (bank exports, quotes, recipes, web pages) lands in `docs/raw/`, gets compiled into the wiki, and is then read as trusted by every later agent.
3. **Automatic code execution:** hooks run agent-written tests with the user's privileges, so injected text can become running code that can reach `.env` and local credentials.

## Controls

| Layer | Control | Where |
|---|---|---|
| Instructions | The trust rule: only the user, in chat, authorises actions; everything read is data. The librarian summarises, cites, and never copies imperative text | `AGENTS.md` ("Trust"), `.claude/agents/wiki-librarian.md` |
| Before each tool call | Guard hook: deny, ask or allow by path, plus shell-command checks. Fails closed | `.claude/hooks/guard-tool.mjs` (PreToolUse) |
| Permissions | `.env` read/write denied; protected paths and `git push` are `ask`; a fallback if hooks can't run | `.claude/settings.json` |
| Before finishing, and in CI | `integrity` check: raw sources unmodified, no tests deleted, baseline not grown, no injection-style text in the wiki or ADRs | `harness/checks/integrity.mjs` ([quality gates](quality-gates.md)) |
| Review | CODEOWNERS on protected paths and ADRs; the reviewer agent reports protected-path changes and weakened tests | `.github/CODEOWNERS`, `.claude/agents/change-reviewer.md` |
| CI | Read-only token, no credentials kept after checkout, integrity diffed against the PR base | `.github/workflows/harness.yml` |

## Protected paths

| Paths | Agent access | Why |
|---|---|---|
| `.claude/settings.json`, `.claude/settings.local.json`, `.claude/hooks/`, `.github/` | **Deny** (ask in maintenance mode) | They define the hooks, permissions and CI themselves |
| `harness/`, `src/app/scripts/`, `src/app/vitest.config.ts` | **Ask** | The gates and their configuration |
| `AGENTS.md`, `CLAUDE.md`, `.claude/agents/` | **Ask** | The schema: how agents behave |
| `docs/raw/` | **Ask**, and existing files are immutable (`integrity`) | Sources are added by the user, never rewritten |
| `.env` files (not `.env.example`) | **Deny**, read and write | Secrets |

The guard's shell checks also deny:
- **Writes to protected paths:** redirects, `tee`, `sed -i`, `cp`/`mv`/`rm`, `Set-Content`/`Out-File`/`Remove-Item`, and `git checkout/restore/rm` on them.
- **Any reference to a `.env` file.**
- **Git bypasses:** `--no-verify`, force-push, and `core.hooksPath` changes.

Reading or running protected files, such as `node harness/check.mjs`, is allowed.

**Maintenance mode:** start Claude Code with the environment variable `JARVIS_HARNESS_MAINTENANCE=1` to turn the critical denies into asks, so an agent can help change the harness with you approving each edit. An agent can't turn this on: hooks see Claude Code's environment, not the environment of the commands an agent runs.

## Injection patterns the integrity check flags

These apply in `docs/wiki/` and `docs/decisions/`, outside code formatting:
- text that overrides earlier instructions
- an agent being told to run, install, delete, push or send something
- download-and-execute commands
- prompt-injection phrasing (for example `system prompt` or `new instructions:`)
- long encoded blobs

Document such patterns inside code formatting, as this page does.

## Residual risk and open items

- **Pattern matching can be bypassed.** The shell guard and the injection scan are heuristics. An encoded command, an unusual interpreter, or a cleverly worded instruction can get past them. They raise the bar, while the `integrity` check, CI and CODEOWNERS review are the backstops.
- **No sandbox yet (finding 3).** Agent sessions still run with your full user privileges. For unattended runs, use Claude Code's sandbox, a dev container, or a cloud session with no local credentials. This needs its own decision, to be made when the loop and graph workflows define unattended runs.
- **Controls load at session start.** A session that started before a settings change doesn't enforce it, so start a new session after changing them. To verify, ask an agent to read `src/app/.env`; it must be refused.
- **Fails closed:** if the guard hook can't run (Node missing or crashing), file and shell tools are blocked until it's fixed.
- **Merge blocking is a GitHub setting:** branch protection on `main` must require the `harness` check and Code Owner review.

## Related

- [Harness](harness.md)
- [Quality gates](quality-gates.md)
- [Validation hooks](validation-hooks.md)
- [ADR 0013](../../decisions/0013-harness-self-protection-and-untrusted-content.md)
- [Raw: threat model](../../raw/2026-10-31-threat-model.md)
