import { describe, expect, it } from 'vitest'
import { categoryOptions, initialEntryForm, personOptions, prepareEntrySubmission, type EntryFormState } from './entryForm'
import type { BudgetCategory } from './table'

const categories: BudgetCategory[] = [
  { id: 'rent', name: 'Rent', bucket: 'need' },
  { id: 'isa', name: 'ISA', bucket: 'saving' }
]

function form(overrides: Partial<EntryFormState> = {}): EntryFormState {
  return { ...initialEntryForm(categories), amount: 50, ...overrides }
}

describe('initialEntryForm', () => {
  it('defaults to the first category, joint, and no amount', () => {
    expect(initialEntryForm(categories)).toMatchObject({ isNewCategory: false, categoryId: 'rent', personKey: 'joint', amount: null })
  })

  it('starts in new-category mode when there are no categories', () => {
    expect(initialEntryForm([])).toMatchObject({ isNewCategory: true, categoryId: undefined })
  })

  it('applies a prefill from the table cell that was clicked', () => {
    expect(initialEntryForm(categories, { categoryId: 'isa', userId: 'u2' })).toMatchObject({ categoryId: 'isa', personKey: 'u2' })
  })
})

describe('options', () => {
  it('puts Joint first in the person list', () => {
    expect(personOptions([{ id: 'u1', displayName: 'Alex' }])).toEqual([
      { id: 'joint', label: 'Joint' },
      { id: 'u1', label: 'Alex' }
    ])
  })

  it('labels categories with their bucket', () => {
    const labels = { need: 'Needs', want: 'Wants', saving: 'Savings' }
    expect(categoryOptions(categories, labels)[1]).toEqual({ id: 'isa', label: 'ISA (Savings)' })
  })
})

describe('prepareEntrySubmission', () => {
  it('rejects a missing or negative amount first', () => {
    expect(prepareEntrySubmission(form({ amount: null }))).toEqual({ ok: false, error: 'Enter a valid amount' })
    expect(prepareEntrySubmission(form({ amount: -1, categoryId: undefined }))).toEqual({ ok: false, error: 'Enter a valid amount' })
  })

  it('requires a category', () => {
    expect(prepareEntrySubmission(form({ categoryId: undefined }))).toEqual({ ok: false, error: 'Select a category' })
  })

  it('requires a name when creating a new category', () => {
    expect(prepareEntrySubmission(form({ isNewCategory: true, newCategoryName: '  ' }))).toEqual({ ok: false, error: 'Enter a category name' })
  })

  it('maps the joint person to a null user and trims notes', () => {
    expect(prepareEntrySubmission(form({ notes: '  rent  ' }))).toEqual({
      ok: true,
      newCategory: null,
      entry: { categoryId: 'rent', userId: null, amount: 50, notes: 'rent' }
    })
  })

  it('returns the new category to create, with no category id yet', () => {
    const result = prepareEntrySubmission(form({ isNewCategory: true, newCategoryName: ' Pets ', newCategoryBucket: 'want', personKey: 'u1', notes: '' }))
    expect(result).toEqual({
      ok: true,
      newCategory: { name: 'Pets', bucket: 'want' },
      entry: { categoryId: null, userId: 'u1', amount: 50, notes: null }
    })
  })
})
