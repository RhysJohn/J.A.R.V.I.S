---
title: Energy
type: integration
status: idea
updated: 2026-10-25
sources: [docs/raw/2026-10-25-jarvis-vision.md]
---

# Energy

Electricity and gas usage and bills for the [home](../domains/home.md) domain.

- **Octopus Energy** has a free REST API with an API key and half-hourly consumption. It's the best option if Octopus is the supplier.
- **Glowmarkt / Bright** gives free access to SMETS2 smart meter data via the DCC, regardless of supplier.
- **Fallback:** manual bill entry, or importing the supplier's CSV.

Readings would be pulled by a scheduled job and stored daily, then compared against the finance "Utilities" budget.

## Related

- [Home](../domains/home.md)
- [Finance](../domains/finance.md)
