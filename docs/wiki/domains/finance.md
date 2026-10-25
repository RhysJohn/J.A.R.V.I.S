---
title: Finance
type: domain
status: active
updated: 2026-10-25
sources: [docs/raw/2026-06-finance-tracker-plan.md, docs/raw/2026-10-25-jarvis-vision.md]
---

# Finance

The `finance` layer (`src/app/layers/finance`) replaces the household's budgeting spreadsheet. The spreadsheet had three sheets: a monthly budget, a pension sheet and a mortgage sheet. The next big step is importing bank statements, so the budget can show **planned vs actual** spending.

## Budget

**Status: done.**

- **Model:** expense categories, each in a bucket (`need`, `want` or `saving`). Budget entries hold a planned amount per category, month and person, with a null person meaning joint. The default categories come from the seed script.
- **Rule:** 50/30/20 (needs/wants/savings). Targets, labels and colours are in `app/utils/budget.ts`.
- **Page `/budget`:** month navigation, bucket summary (actual vs target), donut chart, and an inline-editable table grouped by bucket. Clearing an amount deletes the entry. A modal adds new entries and can create a category inline.

| Route | Purpose |
|---|---|
| `GET /api/budget/categories?includeArchived=` | List categories |
| `POST /api/budget/categories` | Create a category |
| `PATCH /api/budget/categories/:id` | Rename, change bucket or archive |
| `GET /api/budget/entries?month=YYYY-MM-01` | Entries for a month, with category and user |
| `POST /api/budget/entries` | Create an entry (409 if one already exists for that category, person and month) |
| `PATCH /api/budget/entries/:id` | Update amount or notes |
| `DELETE /api/budget/entries/:id` | Delete |

Components live in `app/components/budget/`: `BudgetTable`, `BudgetEntryModal`, `BudgetDonutChart` and `BudgetBucketSummary`. The composable is `app/composables/useBudget.ts`.

## Income

**Status: table only.** `income_sources` holds each person's gross and net monthly income, pension contribution % and effective dates. There's no API or UI yet. It will feed the "income vs planned" view and the 50/30/20 base.

## Pension

**Status: next.** The tables `pension_accounts` and `pension_value_history` exist, and `/pension` is a placeholder.

Planned:
- account CRUD (provider, account name, current value, employee and employer contributions, target retirement age)
- a quick "add value" action for the monthly data point
- cards per account and a value-over-time line chart

## Mortgages

**Status: next.** The tables `mortgages` and `mortgage_balance_history` exist, and `/mortgages` is a placeholder.

Planned:
- support for multiple mortgages, each held by one person or jointly (null holder)
- lender, original amount, current balance, rate, rate type (fixed/variable/tracker), fixed-rate end date and monthly payment
- a quick "add balance" action, cards with a holder badge, and a balance chart
- other loans may reuse this module or get a sibling `loans` table (to decide)

## Statement import (planned)

The core of "am I spending against what I planned?".

- **Transactions table** (finance layer): account, date, description, amount, category, source file and a dedupe hash.
- **Import:** a CSV/OFX upload with **one parser per bank format**. Real column headers are needed first, so scrubbed header samples go in `docs/raw/`.
- **Categorisation rules:** "description contains X → category Y", applied on import and editable.
- **Plan vs actual:** the budget page shows the actual spend per category and month next to the planned amount.
- **Later:** live feeds via [Open Banking](../integrations/open-banking.md), feeding the same transactions table.
- **House link:** transactions can be tagged to a renovation project ([house](house.md)) without finance depending on the house layer. The house layer stores the transaction IDs.

## Related

- [Data conventions](../conventions/data-conventions.md)
- [Database](../architecture/database.md)
- [Roadmap](../roadmap.md)
- [House](house.md)
