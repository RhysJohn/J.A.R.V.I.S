import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { expenseCategories } from '~~/server/database/schema'
import { updateCategorySchema } from '#layers/finance/shared/schemas/budget'

export default defineEventHandler(async (event) => {
  const { householdId } = await requireHouseholdSession(event)
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, updateCategorySchema.parse)

  const [category] = await db
    .update(expenseCategories)
    .set(body)
    .where(and(eq(expenseCategories.id, id), householdScope(expenseCategories.householdId, householdId)))
    .returning()

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  return category
})
