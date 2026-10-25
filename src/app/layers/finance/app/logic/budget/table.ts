import type { ExpenseBucket } from '#layers/finance/shared/schemas/budget'
import { BUCKET_ORDER, sumAmounts } from './buckets'

export interface BudgetCategory {
  id: string
  name: string
  bucket: ExpenseBucket
}

export interface BudgetMember {
  id: string
  displayName: string
}

export interface BudgetEntry {
  id: string
  categoryId: string
  userId: string | null
  amount: number
}

export interface BudgetColumn {
  key: string
  label: string
  // null means the joint (household-level) column.
  userId: string | null
}

export interface BudgetCell {
  column: BudgetColumn
  entry: BudgetEntry | null
}

export interface BudgetRow {
  category: BudgetCategory
  cells: BudgetCell[]
  total: number
}

export interface BudgetGroup {
  bucket: ExpenseBucket
  rows: BudgetRow[]
  total: number
}

export interface BudgetTableModel {
  columns: BudgetColumn[]
  groups: BudgetGroup[]
  grandTotal: number
}

export const JOINT_COLUMN_KEY = 'joint'

export function budgetColumns(members: BudgetMember[]): BudgetColumn[] {
  return [
    ...members.map((member) => ({ key: member.id, label: member.displayName, userId: member.id })),
    { key: JOINT_COLUMN_KEY, label: 'Joint', userId: null }
  ]
}

export function findEntry(entries: BudgetEntry[], categoryId: string, userId: string | null): BudgetEntry | null {
  return entries.find((entry) => entry.categoryId === categoryId && entry.userId === userId) ?? null
}

// Everything the budget table renders: per-person cells, row/bucket totals and the grand
// total, grouped by bucket in 50/30/20 order with empty buckets left out.
export function buildBudgetTable(
  categories: BudgetCategory[],
  entries: BudgetEntry[],
  members: BudgetMember[]
): BudgetTableModel {
  const columns = budgetColumns(members)

  const groups = BUCKET_ORDER.map((bucket) => {
    const rows = categories
      .filter((category) => category.bucket === bucket)
      .map((category) => ({
        category,
        cells: columns.map((column) => ({ column, entry: findEntry(entries, category.id, column.userId) })),
        total: sumAmounts(entries.filter((entry) => entry.categoryId === category.id))
      }))
    return { bucket, rows, total: sumAmounts(rows.map((row) => ({ amount: row.total }))) }
  }).filter((group) => group.rows.length > 0)

  return { columns, groups, grandTotal: sumAmounts(entries) }
}

export type AmountEdit = { kind: 'delete' } | { kind: 'update'; amount: number } | { kind: 'none' }

// What an inline amount edit means. Clearing the cell deletes the entry; an unchanged,
// negative or non-numeric value is ignored. `rawValue` may be a number because Vue's
// v-model on <input type="number"> coerces valid input to a Number at runtime.
export function resolveAmountEdit(rawValue: string | number, currentAmount: number): AmountEdit {
  const trimmed = String(rawValue).trim()
  if (trimmed === '') return { kind: 'delete' }
  const amount = Number(trimmed)
  if (Number.isNaN(amount) || amount < 0 || amount === currentAmount) return { kind: 'none' }
  return { kind: 'update', amount }
}
