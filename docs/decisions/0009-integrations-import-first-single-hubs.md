# 0009 — Integrations: manual/import first, one hub per area, no basket automation

- **Status:** proposed (direction agreed in discussion; confirm per integration before building it)
- **Date:** 2026-10-25
- **Deciders:** user (pending)

## Context

The vision includes:
- bank statements and live bank feeds
- energy bills and usage
- smart-home controls (lights, temperature)
- getting the meal shopping list into a supermarket (Tesco)

Each external integration adds cost, consent renewals, secrets and failure modes. Some have no public API at all.

## Decision (proposed)

- **Manual entry or file import first, live feeds second.** Every feature must work without the integration. Bank data starts as CSV/OFX import, with one parser per bank, written against scrubbed real headers. A later Open Banking feed (TrueLayer, Yapily, Plaid or GoCardless; check current terms) writes into the same transactions table.
- **One hub per area instead of per-brand integrations:**
  - **Smart home:** Home Assistant, via its REST or WebSocket API, read-only first. It's reached from the cloud through Nabu Casa, a Cloudflare Tunnel or Tailscale (to choose).
  - **Energy:** the Octopus API if Octopus is the supplier; otherwise Glowmarkt/Bright for SMETS2 meters; otherwise manual or CSV.
- **No supermarket basket automation.** Tesco has no public basket API, and scripting its website is fragile and likely against its terms. The shopping list is exported as clean, generic text to paste or share.

## Alternatives considered

- **Live integrations from day one:** blocks features on third-party approval and pricing, and adds 90-day consent renewals early.
- **Direct integrations per device brand:** an integration for every light and thermostat brand, against Home Assistant's existing coverage.
- **Browser automation of the Tesco basket:** breaks on site changes and risks the account.

## Consequences

- Open questions to settle before building each integration:
  - which banks and provider pricing
  - the energy supplier and meter type
  - whether Home Assistant is already running, and the tunnel choice
- Live feeds need scheduled jobs, which affects hosting ([0006](0006-azure-container-apps-hosting.md)).
- When an integration is built, write an ADR accepting its specific choice, and update this one's status.

## Related

- [Open Banking](../wiki/integrations/open-banking.md)
- [Energy](../wiki/integrations/energy.md)
- [Home Assistant](../wiki/integrations/home-assistant.md)
- [Supermarket](../wiki/integrations/supermarket.md)
- [Raw: vision](../raw/2026-10-25-jarvis-vision.md)
