---
title: Home Assistant
type: integration
status: idea
updated: 2026-10-25
sources: [docs/raw/2026-10-25-jarvis-vision.md]
---

# Home Assistant

Use **Home Assistant** as the single hub for smart devices (lights, thermostats, temperature sensors) instead of integrating each brand separately. J.A.R.V.I.S talks to its REST or WebSocket API with a long-lived access token.

- **Reachability:** the app runs in Azure and Home Assistant runs on the home network, so it needs exposing. The options are Nabu Casa (paid, simplest), a Cloudflare Tunnel, or Tailscale.
- **Security:** the token grants full control of the house, so store it as a secret and start read-only.

## Related

- [Home](../domains/home.md)
- [Deployment](../architecture/deployment.md#open-questions)
