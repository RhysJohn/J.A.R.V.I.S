---
title: Meals
type: domain
status: planned
updated: 2026-10-25
sources: [docs/raw/2026-10-25-jarvis-vision.md]
---

# Meals

**Planned layer `meals`.** A library of meals the household likes, a weekly plan, and a shopping list generated from the plan that can go into a supermarket app such as Tesco.

## Scope (draft)

- **Meals:** name, notes, tags (quick, batch-cook and so on), who likes it, and servings.
- **Ingredients** per meal, with a quantity and unit. Keep a normalised ingredient list so the shopping list can combine quantities (2 onions + 1 onion = 3 onions).
- **Weekly planner:** assign meals to days, scale servings, and possibly suggest from favourites.
- **Shopping list:** aggregate the week's ingredients and subtract what's already in the cupboard (optional pantry list), then group by aisle or category.
- **Export:** see [supermarket](../integrations/supermarket.md). There's no public basket API, so the output is a clean list for pasting or sharing.
- **Possible budget link:** an estimated weekly grocery cost against the finance "Groceries" category.

## Open questions

- How to handle units and conversions (grams vs "1 tin").
- Whether to import recipes from URLs.

## Related

- [Supermarket integration](../integrations/supermarket.md)
- [Finance](finance.md)
- [Roadmap](../roadmap.md)
