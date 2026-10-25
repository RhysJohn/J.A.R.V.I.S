import { eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { users } from '~~/server/database/schema'
import { changePasswordSchema } from '#layers/core/shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireHouseholdSession(event)
  const body = await readValidatedBody(event, changePasswordSchema.parse)

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const isValid = await verifyPassword(user.passwordHash, body.currentPassword)
  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: 'Current password is incorrect' })
  }

  const newPasswordHash = await hashPassword(body.newPassword)
  await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, userId))

  return { success: true }
})
