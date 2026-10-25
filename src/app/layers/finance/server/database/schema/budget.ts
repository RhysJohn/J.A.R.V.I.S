import { boolean, date, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { households } from '../../../../core/server/database/schema/households'
import { users } from '../../../../core/server/database/schema/users'

export const expenseBucket = pgEnum('expense_bucket', ['need', 'want', 'saving'])

export const expenseCategories = pgTable('expense_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id),
  name: text('name').notNull(),
  bucket: expenseBucket('bucket').notNull(),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const budgetEntries = pgTable(
  'budget_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    householdId: uuid('household_id')
      .notNull()
      .references(() => households.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => expenseCategories.id),
    userId: uuid('user_id').references(() => users.id),
    month: date('month').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    // Plain UNIQUE treats every NULL as distinct, so per-person and joint (userId IS NULL)
    // entries need separate partial indexes to actually enforce "one entry per month".
    uniqueIndex('budget_entries_person_month_idx')
      .on(table.categoryId, table.userId, table.month)
      .where(sql`${table.userId} is not null`),
    uniqueIndex('budget_entries_joint_month_idx')
      .on(table.categoryId, table.month)
      .where(sql`${table.userId} is null`)
  ]
)
