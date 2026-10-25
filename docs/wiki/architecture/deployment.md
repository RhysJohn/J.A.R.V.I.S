---
title: Deployment
type: architecture
status: planned
updated: 2026-10-25
sources: [docs/raw/2026-06-finance-tracker-plan.md]
---

# Deployment

**Not deployed yet.** The plan is Azure, using free credits, in region `uksouth`.

## Plan

1. Write a multi-stage `Dockerfile`: build on `node:22-alpine` with `npm ci && npm run build`, then a runtime stage that copies only `.output/` and runs `node .output/server/index.mjs`. Build context is `src/app`.
2. `az group create`, then `az postgres flexible-server create` (Burstable B1ms, Postgres 16). Restrict the firewall to Azure services and the developer's IP.
3. Run `npm run db:migrate` against the Azure database before the first deploy, then `npm run db:seed` once.
4. `az containerapp up --source src/app --ingress external --target-port 3000`.
5. Store `DATABASE_URL` and `NUXT_SESSION_PASSWORD` as Container Apps secrets, wired in with `secretref:`.
6. Set `--min-replicas 0 --max-replicas 1` (scale to zero to save credits).
7. Smoke test from two devices with both accounts.

CI/CD (GitHub Actions in `cicd/`) comes later.

## Open questions

- **Integrations need scheduled jobs:** bank sync and energy readings need a scheduler, such as a Container Apps job or a Nitro scheduled task. With scale to zero, an in-process cron won't run reliably.
- **Home Assistant reachability:** a cloud app can't reach the home LAN directly. See [Home Assistant](../integrations/home-assistant.md).

## Related

- [Stack](stack.md)
- [Roadmap](../roadmap.md)
