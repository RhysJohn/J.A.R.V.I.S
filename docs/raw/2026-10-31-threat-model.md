# Threat model: J.A.R.V.I.S (AI security review, 2026-10-31)

This is the threat-modelling exercise requested by the user ("As a AI security engineer do a threat modelling exercise against the repo"), as delivered in the session, against `feature/harness-framework` at `c839ad1`. It's recorded as a source; the wiki page `architecture/agent-security.md` compiles the parts acted on.

## Headline

The app's own exposure is modest for now: one household, behind a login, not yet deployed. The bigger risk is the **agent harness**:
- agents can edit the files that define their own guardrails
- hooks automatically run code that agents write
- the wiki, which agents are told to trust, is compiled from outside material

Together these make a path from injected text to code running on the developer's machine.

## Assets

- **Household financial data**: budgets, pensions, mortgages, and later bank transactions.
- **Credentials**: `src/app/.env`, `NUXT_SESSION_PASSWORD`, and later bank, energy and Home Assistant tokens.
- **The developer machine**: git credentials, Azure CLI login, browser sessions.
- **Harness integrity**: hooks, guard, tests, baseline, AGENTS.md, wiki, ADRs.
- **Future smart-home control**, which moves the risk into the physical world.

## Trust boundaries

- The internet to the Nuxt app (login, `/api`), and the app to Postgres. Future: Azure, with a public URL.
- The app to external services (future): Open Banking, Octopus, Home Assistant on the home network.
- The user to the Claude Code agents. Agents read AGENTS.md, the wiki, ADRs and agent files as trusted, and `docs/raw` as data. They edit files, and hooks automatically run node and vitest on them.
- Pull requests to GitHub Actions (`npm ci`, tests, build).

## Findings

### P1 (before unattended agent use)

1. **Agents can switch off their own guardrails.** There's no `permissions` block, and agents can edit `.claude/settings.json`, hooks, `harness/`, the guard script, the typecheck baseline and tests. The AGENTS.md rule is only an instruction.
   - **Fix:** permission rules; a guard hook (including for shell commands); CODEOWNERS plus branch protection; a check that fails on deleted tests.
2. **The wiki can be poisoned with injected instructions.** Outside content in `docs/raw` (CSVs, quotes, recipes, web pages) is compiled into wiki pages, which AGENTS.md calls the source of truth. Injected instructions would persist across all later sessions.
   - **Fix:** a rule that content is never instructions; the librarian summarises and keeps provenance, never copying imperatives; a check for injection-style patterns; human review of wiki changes from ingests.
3. **Hooks run agent-written code with the user's privileges.** The after-edit hook runs edited tests immediately, and the Stop hook runs the whole suite. Combined with findings 1 and 2, injected text becomes running code that can read `.env`, `~/.azure` and git credentials.
   - **Fix:** a sandbox or dev container; Read deny rules for `.env` and credential stores; unattended runs in disposable environments.
4. **Records can point at another household's data.** `POST /api/budget/entries` inserts `{ householdId, ...body }` without checking that `categoryId` and `userId` belong to the household, and the GET loads the related category.
   - **Fix:** ownership checks; composite foreign keys on `(household_id, id)`; household-isolation tests.
5. **The login is too weak for a public URL.** There's no rate limiting or lockout, a password is the only factor, and an unknown email returns before any hashing, which leaks which emails exist through timing.
   - **Fix:** a constant-time path; rate limiting by IP and email; an identity layer in front of the app (Container Apps auth with Microsoft accounts, or Cloudflare Access). Needs an ADR before deploying.

### P2 (before deploying)

6. **CI supply chain:** no `permissions:` block, actions pinned by tag rather than SHA, and install scripts run from pull requests.
   - **Fix:** `contents: read`, pinned SHAs, Dependabot, an audit check.
7. **Secrets:** `SEED_*` passwords remain in `.env`, and nothing scans for secrets or personal data.
   - **Fix:** remove them after seeding; a gitleaks check; gitignore raw CSV/OFX files; Key Vault in production.
8. **Local Postgres** is published on every interface (`5432:5432`) with `postgres/postgres`.
   - **Fix:** bind it to `127.0.0.1`.
9. **Sessions** use stateless sealed cookies (`sameSite: lax`), with no revocation, and a password change doesn't log out other devices.
   - **Fix:** a `sessionVersion` column, a short max age, secure cookies.
10. **No security headers or CSP.**
    - **Fix:** the `nuxt-security` module.
11. **A third-party plugin is enabled in the project settings** (superpowers).
    - **Fix:** move it to user settings, or review and pin it.

### P3 (as features arrive)

12. **Integrations:** a Home Assistant token gives full control of the house, and Open Banking tokens give access to accounts.
    - **Fix:** least privilege, Key Vault, limited outbound hosts, an audit log, explicit confirmation for anything that operates a device.
13. **A future in-app AI assistant:** bank transaction descriptions, recipes and emails are attacker-controlled text.
    - **Fix:** never let it operate devices or move money without human confirmation; record an ADR first.
14. **No audit trail**, and no logging or backup policy.
    - **Fix:** `createdBy`/`updatedBy` columns, an audit table, keeping personal data out of logs, confirming backup and retention.

## Suggested order

1. Harness self-protection (findings 1–3). **The user chose to do this first.**
2. Household ownership (finding 4).
3. Dev environment and CI hygiene (findings 6–8).
4. An authentication decision before deploying, plus headers and sessions (findings 5, 9 and 10).
