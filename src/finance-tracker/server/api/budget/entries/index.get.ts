import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~~/server/database'
import { budgetEntries } from '~~/server/database/schema'
import { monthSchema } from '~~/shared/schemas/budget'

export default defineEventHandler(async (event) => {
  const { householdId } = await requireHouseholdSession(event)
  const { month } = await getValidatedQuery(event, z.object({ month: monthSchema }).parse)

  return db.query.budgetEntries.findMany({
    where: and(householdScope(budgetEntries.householdId, householdId), eq(budgetEntries.month, month)),
    with: { category: true, user: { columns: { id: true, displayName: true } } }
  })
})
