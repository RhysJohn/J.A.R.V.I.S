import { relations } from 'drizzle-orm'
import { households } from './households'
import { users } from './users'

// Only core-to-core relations live here. Feature layers declare their own `one(households/users)`
// relations, so core never has to import (or know about) any feature layer's tables.
export const householdsRelations = relations(households, ({ many }) => ({
  users: many(users)
}))

export const usersRelations = relations(users, ({ one }) => ({
  household: one(households, { fields: [users.householdId], references: [households.id] })
}))
