import type {
  CreateBudgetEntryInput,
  CreateCategoryInput,
  UpdateBudgetEntryInput,
  UpdateCategoryInput
} from '~~/shared/schemas/budget'

export function useBudgetCategories() {
  return useFetch('/api/budget/categories', { key: 'budget-categories' })
}

export function useBudgetEntries(month: Ref<string>) {
  return useFetch('/api/budget/entries', {
    key: () => `budget-entries-${month.value}`,
    query: { month },
    watch: [month]
  })
}

export function createBudgetCategory(input: CreateCategoryInput) {
  return $fetch('/api/budget/categories', { method: 'POST', body: input })
}

export function updateBudgetCategory(id: string, input: UpdateCategoryInput) {
  return $fetch(`/api/budget/categories/${id}`, { method: 'PATCH', body: input })
}

export function createBudgetEntry(input: CreateBudgetEntryInput) {
  return $fetch('/api/budget/entries', { method: 'POST', body: input })
}

export function updateBudgetEntry(id: string, input: UpdateBudgetEntryInput) {
  return $fetch(`/api/budget/entries/${id}`, { method: 'PATCH', body: input })
}

export function deleteBudgetEntry(id: string) {
  return $fetch(`/api/budget/entries/${id}`, { method: 'DELETE' })
}
