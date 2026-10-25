import { db } from '~~/server/database'
import { budgetEntries } from '~~/server/database/schema'
import { createBudgetEntrySchema } from '~~/shared/schemas/budget'

export default defineEventHandler(async (event) => {
  const { householdId } = await requireHouseholdSession(event)
  const body = await readValidatedBody(event, createBudgetEntrySchema.parse)

  try {
    const [entry] = await db
      .insert(budgetEntries)
      .values({ householdId, ...body })
      .returning()
    return entry
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'An entry already exists for this category, person, and month' })
    }
    throw error
  }
})
