import { eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { users } from '~~/server/database/schema'
import { loginSchema } from '~~/shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)

  const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const isValid = await verifyPassword(user.passwordHash, body.password)
  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      householdId: user.householdId,
      email: user.email,
      displayName: user.displayName
    }
  })

  return { id: user.id, email: user.email, displayName: user.displayName }
})
