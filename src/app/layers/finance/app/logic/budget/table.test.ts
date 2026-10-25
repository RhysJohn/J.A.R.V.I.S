import { describe, expect, it } from 'vitest'
import { budgetColumns, buildBudgetTable, findEntry, resolveAmountEdit, type BudgetCategory, type BudgetEntry } from './table'

const members = [
  { id: 'u1', displayName: 'Alex' },
  { id: 'u2', displayName: 'Sam' }
]

const categories: BudgetCategory[] = [
  { id: 'rent', name: 'Rent', bucket: 'need' },
  { id: 'food', name: 'Groceries', bucket: 'need' },
  { id: 'isa', name: 'ISA', bucket: 'saving' }
]

const entries: BudgetEntry[] = [
  { id: 'e1', categoryId: 'rent', userId: null, amount: 1200 },
  { id: 'e2', categoryId: 'food', userId: 'u1', amount: 150 },
  { id: 'e3', categoryId: 'food', userId: 'u2', amount: 100 },
  { id: 'e4', categoryId: 'isa', userId: 'u1', amount: 250 }
]

describe('budgetColumns', () => {
  it('lists each member then a joint column', () => {
    expect(budgetColumns(members)).toEqual([
      { key: 'u1', label: 'Alex', userId: 'u1' },
      { key: 'u2', label: 'Sam', userId: 'u2' },
      { key: 'joint', label: 'Joint', userId: null }
    ])
  })
})

describe('findEntry', () => {
  it('distinguishes joint (null user) from person entries', () => {
    expect(findEntry(entries, 'rent', null)?.id).toBe('e1')
    expect(findEntry(entries, 'rent', 'u1')).toBeNull()
  })
})

describe('buildBudgetTable', () => {
  const table = buildBudgetTable(categories, entries, members)

  it('groups rows by bucket in 50/30/20 order and drops empty buckets', () => {
    expect(table.groups.map((group) => group.bucket)).toEqual(['need', 'saving'])
  })

  it('places each entry in the right person/joint cell', () => {
    const food = table.groups[0]!.rows.find((row) => row.category.id === 'food')!
    expect(food.cells.map((cell) => cell.entry?.id ?? null)).toEqual(['e2', 'e3', null])
  })

  it('totals rows, buckets and the whole month', () => {
    const [needs, savings] = table.groups
    expect(needs!.rows.map((row) => row.total)).toEqual([1200, 250])
    expect(needs!.total).toBe(1450)
    expect(savings!.total).toBe(250)
    expect(table.grandTotal).toBe(1700)
  })
})

describe('resolveAmountEdit', () => {
  it('deletes the entry when the cell is cleared', () => {
    expect(resolveAmountEdit('  ', 100)).toEqual({ kind: 'delete' })
  })

  it('updates with a new valid amount, including numbers coerced by v-model', () => {
    expect(resolveAmountEdit('120.5', 100)).toEqual({ kind: 'update', amount: 120.5 })
    expect(resolveAmountEdit(80, 100)).toEqual({ kind: 'update', amount: 80 })
  })

  it('ignores unchanged, negative and non-numeric values', () => {
    expect(resolveAmountEdit('100', 100)).toEqual({ kind: 'none' })
    expect(resolveAmountEdit('-5', 100)).toEqual({ kind: 'none' })
    expect(resolveAmountEdit('abc', 100)).toEqual({ kind: 'none' })
  })
})
