import { eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { households } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const { householdId } = await requireHouseholdSession(event)

  const household = await db.query.households.findFirst({
    where: eq(households.id, householdId),
    with: { users: { columns: { id: true, displayName: true, email: true } } }
  })

  if (!household) {
    throw createError({ statusCode: 404, statusMessage: 'Household not found' })
  }

  return household
})
