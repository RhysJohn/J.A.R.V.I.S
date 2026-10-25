import { date, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { households } from './households'
import { users } from './users'

export const incomeSources = pgTable('income_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  monthlyGrossAmount: numeric('monthly_gross_amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  monthlyNetAmount: numeric('monthly_net_amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  pensionContributionPercent: numeric('pension_contribution_percent', { precision: 5, scale: 2, mode: 'number' }),
  effectiveFrom: date('effective_from').notNull(),
  effectiveTo: date('effective_to'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})
