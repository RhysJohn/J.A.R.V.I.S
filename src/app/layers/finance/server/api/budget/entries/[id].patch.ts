import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { budgetEntries } from '~~/server/database/schema'
import { updateBudgetEntrySchema } from '#layers/finance/shared/schemas/budget'

export default defineEventHandler(async (event) => {
  const { householdId } = await requireHouseholdSession(event)
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, updateBudgetEntrySchema.parse)

  const [entry] = await db
    .update(budgetEntries)
    .set(body)
    .where(and(eq(budgetEntries.id, id), householdScope(budgetEntries.householdId, householdId)))
    .returning()

  if (!entry) {
    throw createError({ statusCode: 404, statusMessage: 'Budget entry not found' })
  }

  return entry
})
