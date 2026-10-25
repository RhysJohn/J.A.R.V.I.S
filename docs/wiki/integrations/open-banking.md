---
title: Open Banking
type: integration
status: idea
updated: 2026-10-25
sources: [docs/raw/2026-10-25-jarvis-vision.md, docs/decisions/0009-integrations-import-first-single-hubs.md]
---

# Open Banking

Live bank transaction feeds to replace manual CSV import in [finance](../domains/finance.md#statement-import-planned).

- **Approach:** build CSV/OFX import first. It works with every bank and needs no approval. A feed later writes into the same transactions table.
- **Providers (UK):** TrueLayer, Yapily, Plaid, GoCardless Bank Account Data. Free access for individuals has been shrinking, so check current terms and pricing before choosing.
- **Constraints:** consent must be renewed every 90 days. A feed needs a scheduled sync job (see [deployment](../architecture/deployment.md#open-questions)), and access tokens are secrets.

## Related

- [Finance](../domains/finance.md)
