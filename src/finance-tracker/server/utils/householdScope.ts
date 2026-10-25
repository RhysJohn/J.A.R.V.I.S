import { eq, type AnyColumn } from 'drizzle-orm'

/**
 * Named wrapper around `eq(table.householdId, householdId)` so every household-scoped
 * query in the codebase is grep-able through one call site, instead of relying on each
 * handler remembering to add the filter itself.
 */
export function householdScope(householdIdColumn: AnyColumn, householdId: string) {
  return eq(householdIdColumn, householdId)
}
