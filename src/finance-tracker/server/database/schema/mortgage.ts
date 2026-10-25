import { date, numeric, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { households } from './households'
import { users } from './users'

export const mortgageRateType = pgEnum('mortgage_rate_type', ['fixed', 'variable', 'tracker'])

export const mortgages = pgTable('mortgages', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id),
  holderUserId: uuid('holder_user_id').references(() => users.id),
  lender: text('lender').notNull(),
  originalAmount: numeric('original_amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  currentBalance: numeric('current_balance', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  interestRate: numeric('interest_rate', { precision: 5, scale: 3, mode: 'number' }).notNull(),
  rateType: mortgageRateType('rate_type').notNull(),
  fixedRateEndDate: date('fixed_rate_end_date'),
  monthlyPayment: numeric('monthly_payment', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  startDate: date('start_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const mortgageBalanceHistory = pgTable('mortgage_balance_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  mortgageId: uuid('mortgage_id')
    .notNull()
    .references(() => mortgages.id),
  balanceDate: date('balance_date').notNull(),
  balance: numeric('balance', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})
