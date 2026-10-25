import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { expenseCategories } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const { householdId } = await requireHouseholdSession(event)
  const { includeArchived } = getQuery(event)

  const conditions = [householdScope(expenseCategories.householdId, householdId)]
  if (includeArchived !== 'true') {
    conditions.push(eq(expenseCategories.isArchived, false))
  }

  return db
    .select()
    .from(expenseCategories)
    .where(and(...conditions))
    .orderBy(expenseCategories.bucket, expenseCategories.name)
})
