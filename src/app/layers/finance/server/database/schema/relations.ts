import { relations } from 'drizzle-orm'
import { households } from '../../../../core/server/database/schema/households'
import { users } from '../../../../core/server/database/schema/users'
import { incomeSources } from './income-sources'
import { expenseCategories, budgetEntries } from './budget'
import { pensionAccounts, pensionValueHistory } from './pension'
import { mortgages, mortgageBalanceHistory } from './mortgage'

export const incomeSourcesRelations = relations(incomeSources, ({ one }) => ({
  household: one(households, { fields: [incomeSources.householdId], references: [households.id] }),
  user: one(users, { fields: [incomeSources.userId], references: [users.id] })
}))

export const expenseCategoriesRelations = relations(expenseCategories, ({ one, many }) => ({
  household: one(households, { fields: [expenseCategories.householdId], references: [households.id] }),
  budgetEntries: many(budgetEntries)
}))

export const budgetEntriesRelations = relations(budgetEntries, ({ one }) => ({
  household: one(households, { fields: [budgetEntries.householdId], references: [households.id] }),
  category: one(expenseCategories, { fields: [budgetEntries.categoryId], references: [expenseCategories.id] }),
  user: one(users, { fields: [budgetEntries.userId], references: [users.id] })
}))

export const pensionAccountsRelations = relations(pensionAccounts, ({ one, many }) => ({
  household: one(households, { fields: [pensionAccounts.householdId], references: [households.id] }),
  user: one(users, { fields: [pensionAccounts.userId], references: [users.id] }),
  valueHistory: many(pensionValueHistory)
}))

export const pensionValueHistoryRelations = relations(pensionValueHistory, ({ one }) => ({
  account: one(pensionAccounts, { fields: [pensionValueHistory.pensionAccountId], references: [pensionAccounts.id] })
}))

export const mortgagesRelations = relations(mortgages, ({ one, many }) => ({
  household: one(households, { fields: [mortgages.householdId], references: [households.id] }),
  holder: one(users, { fields: [mortgages.holderUserId], references: [users.id] }),
  balanceHistory: many(mortgageBalanceHistory)
}))

export const mortgageBalanceHistoryRelations = relations(mortgageBalanceHistory, ({ one }) => ({
  mortgage: one(mortgages, { fields: [mortgageBalanceHistory.mortgageId], references: [mortgages.id] })
}))
