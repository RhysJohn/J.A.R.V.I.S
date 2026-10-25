import { db } from '~~/server/database'
import { expenseCategories } from '~~/server/database/schema'
import { createCategorySchema } from '#layers/finance/shared/schemas/budget'

export default defineEventHandler(async (event) => {
  const { householdId } = await requireHouseholdSession(event)
  const body = await readValidatedBody(event, createCategorySchema.parse)

  const [category] = await db
    .insert(expenseCategories)
    .values({ householdId, name: body.name, bucket: body.bucket })
    .returning()

  return category
})
