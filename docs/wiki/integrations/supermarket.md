---
title: Supermarket
type: integration
status: idea
updated: 2026-10-25
sources: [docs/raw/2026-10-25-jarvis-vision.md]
---

# Supermarket (Tesco)

Getting the [meals](../domains/meals.md) shopping list into a supermarket.

- **Tesco has no public API** for adding items to a basket. Automating the website would be fragile and likely against its terms, so don't.
- **Realistic options:**
  - copy a clean one-item-per-line list into Tesco's search for multiple items
  - share the list to the phone (or to a notes or list app)
  - print it
- Keep the list generic (ingredient names, not product IDs) so it works with any supermarket.

## Related

- [Meals](../domains/meals.md)
