import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { budgetEntries } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const { householdId } = await requireHouseholdSession(event)
  const id = getRouterParam(event, 'id')!

  const [entry] = await db
    .delete(budgetEntries)
    .where(and(eq(budgetEntries.id, id), householdScope(budgetEntries.householdId, householdId)))
    .returning()

  if (!entry) {
    throw createError({ statusCode: 404, statusMessage: 'Budget entry not found' })
  }

  return { success: true }
})
