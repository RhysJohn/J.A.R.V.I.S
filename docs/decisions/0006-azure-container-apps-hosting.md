# 0006 — Host on Azure Container Apps + Azure Database for PostgreSQL

- **Status:** accepted (not yet implemented)
- **Date:** 2026-06 (recorded 2026-10-25)
- **Deciders:** user

## Context

The app must be reachable from the cloud by both partners. The user has Azure free credits. Traffic is tiny (two users), so cost dominates.

## Decision

- **Azure Container Apps** runs the Nuxt server from a multi-stage `node:22-alpine` image, with `--min-replicas 0 --max-replicas 1`, so it scales to zero between uses. Region is `uksouth`.
- **Azure Database for PostgreSQL Flexible Server**, Burstable B1ms, Postgres 16. The firewall allows only Azure services and the developer's IP.
- Secrets (`DATABASE_URL`, `NUXT_SESSION_PASSWORD`) are Container Apps secrets referenced with `secretref:`.
- Deploy manually with `az containerapp up --source` at first; CI/CD comes later.

## Alternatives considered

- **Vercel + Supabase/Neon:** free tiers and less ops, but it doesn't use the Azure credits. Revisit if the credits run out.
- **Self-hosting at home:** no hosting cost, and it sits next to Home Assistant. But it needs a home server and exposure to the internet.
- **An always-on App Service:** simpler networking, but it costs more than scale-to-zero.

## Consequences

- Cold starts after idle periods are accepted.
- **Scheduled jobs** (bank and energy sync) can't rely on an in-process cron while scaled to zero. They need Container Apps jobs or similar, as a separate decision.
- **Home Assistant** on the home network isn't directly reachable from Azure; see [0009](0009-integrations-import-first-single-hubs.md).
- Revisit when the credits expire or a cheaper option fits better.

## Related

- [Deployment](../wiki/architecture/deployment.md)
- [Raw: finance-tracker plan](../raw/2026-06-finance-tracker-plan.md)
