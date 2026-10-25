import { date, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { households } from './households'
import { users } from './users'

export const pensionAccounts = pgTable('pension_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  provider: text('provider').notNull(),
  accountName: text('account_name').notNull(),
  currentValue: numeric('current_value', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  employeeContributionMonthly: numeric('employee_contribution_monthly', { precision: 12, scale: 2, mode: 'number' }),
  employerContributionMonthly: numeric('employer_contribution_monthly', { precision: 12, scale: 2, mode: 'number' }),
  contributionPercent: numeric('contribution_percent', { precision: 5, scale: 2, mode: 'number' }),
  targetRetirementAge: integer('target_retirement_age'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const pensionValueHistory = pgTable('pension_value_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  pensionAccountId: uuid('pension_account_id')
    .notNull()
    .references(() => pensionAccounts.id),
  valueDate: date('value_date').notNull(),
  value: numeric('value', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})
