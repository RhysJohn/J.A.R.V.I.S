import type { H3Event } from 'h3'

export async function requireHouseholdSession(event: H3Event) {
  const { user } = await requireUserSession(event)
  return { userId: user.id, householdId: user.householdId }
}
