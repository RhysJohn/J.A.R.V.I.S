import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const households = pgTable('households', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  currency: text('currency').notNull().default('GBP'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})
