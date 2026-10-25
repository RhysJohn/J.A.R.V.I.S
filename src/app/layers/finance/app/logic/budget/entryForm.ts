import type { CreateBudgetEntryInput, CreateCategoryInput, ExpenseBucket } from '#layers/finance/shared/schemas/budget'
import type { BudgetCategory, BudgetMember } from './table'

export const JOINT_PERSON_KEY = 'joint'

export interface EntryFormState {
  isNewCategory: boolean
  // undefined (not null) when nothing is selected, to match USelectMenu's v-model type.
  categoryId: string | undefined
  newCategoryName: string
  newCategoryBucket: ExpenseBucket
  personKey: string
  amount: number | null
  notes: string
}

export interface EntryFormPrefill {
  categoryId?: string | null
  userId?: string | null
}

export interface SelectOption {
  id: string
  label: string
}

export type EntrySubmission =
  | { ok: false; error: string }
  | {
      ok: true
      // Set when the entry needs a new category created first; `entry.categoryId` is then null.
      newCategory: CreateCategoryInput | null
      entry: Omit<CreateBudgetEntryInput, 'categoryId' | 'month'> & { categoryId: string | null }
    }

export function initialEntryForm(categories: BudgetCategory[], prefill?: EntryFormPrefill | null): EntryFormState {
  return {
    isNewCategory: categories.length === 0,
    categoryId: prefill?.categoryId ?? categories[0]?.id,
    newCategoryName: '',
    newCategoryBucket: 'need',
    personKey: prefill?.userId ?? JOINT_PERSON_KEY,
    amount: null,
    notes: ''
  }
}

export function personOptions(members: BudgetMember[]): SelectOption[] {
  return [{ id: JOINT_PERSON_KEY, label: 'Joint' }, ...members.map((member) => ({ id: member.id, label: member.displayName }))]
}

export function categoryOptions(categories: BudgetCategory[], bucketLabels: Record<ExpenseBucket, string>): SelectOption[] {
  return categories.map((category) => ({ id: category.id, label: `${category.name} (${bucketLabels[category.bucket]})` }))
}

// Validates the form in the order the user sees errors: amount, then category.
export function prepareEntrySubmission(form: EntryFormState): EntrySubmission {
  if (form.amount === null || Number.isNaN(form.amount) || form.amount < 0) {
    return { ok: false, error: 'Enter a valid amount' }
  }

  const userId = form.personKey === JOINT_PERSON_KEY ? null : form.personKey
  const entry = { userId, amount: form.amount, notes: form.notes.trim() || null }

  if (form.isNewCategory) {
    const name = form.newCategoryName.trim()
    if (!name) return { ok: false, error: 'Enter a category name' }
    return { ok: true, newCategory: { name, bucket: form.newCategoryBucket }, entry: { ...entry, categoryId: null } }
  }

  if (!form.categoryId) return { ok: false, error: 'Select a category' }
  return { ok: true, newCategory: null, entry: { ...entry, categoryId: form.categoryId } }
}
