---
title: Home
type: domain
status: idea
updated: 2026-10-25
sources: [docs/raw/2026-10-25-jarvis-vision.md]
---

# Home

**Idea: a possible `home` layer** for energy (electricity and gas usage and bills) and smart-home state (lights, temperature sensors, heating). This is a long-term goal.

## Scope (draft)

- **Energy:** half-hourly or daily usage, cost, and tariff, with bills compared to the finance "Utilities" budget. See [energy](../integrations/energy.md).
- **Smart home:** read-only first (temperatures, which lights are on), then simple controls. Use Home Assistant as the single integration. See [Home Assistant](../integrations/home-assistant.md).

## Open questions

- Energy supplier and meter type (SMETS2?).
- Whether Home Assistant is already running, and how the cloud app will reach it.

## Related

- [Energy](../integrations/energy.md)
- [Home Assistant](../integrations/home-assistant.md)
- [Deployment](../architecture/deployment.md#open-questions)
