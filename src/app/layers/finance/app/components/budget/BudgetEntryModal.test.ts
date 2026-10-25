import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import BudgetEntryModal from './BudgetEntryModal.vue'

const { toastAdd, submitBudgetEntry } = vi.hoisted(() => ({
  toastAdd: vi.fn(),
  submitBudgetEntry: vi.fn()
}))

mockNuxtImport('useToast', () => () => ({ add: toastAdd }))
mockNuxtImport('submitBudgetEntry', () => submitBudgetEntry)

const props = {
  open: true,
  month: '2026-10-01',
  currency: 'GBP',
  members: [{ id: 'u1', displayName: 'Alex' }],
  categories: [{ id: 'rent', name: 'Rent', bucket: 'need' as const }]
}

// UModal teleports its content to <body>, so the form is found on the document.
function form() {
  return document.querySelector<HTMLFormElement>('[data-testid="entry-form"]')!
}

async function setAmount(value: string) {
  const input = form().querySelector<HTMLInputElement>('input[type="number"]')!
  input.value = value
  input.dispatchEvent(new Event('input'))
  await flushPromises()
}

async function submit() {
  form().dispatchEvent(new Event('submit'))
  await flushPromises()
}

afterEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ''
})

describe('BudgetEntryModal', () => {
  it('shows the month being budgeted', async () => {
    await mountSuspended(BudgetEntryModal, { props, attachTo: document.body })

    const monthInput = form().querySelector<HTMLInputElement>('input[disabled]')!
    expect(monthInput.value).toBe('October 2026')
  })

  it('shows the validation error and does not submit without an amount', async () => {
    await mountSuspended(BudgetEntryModal, { props, attachTo: document.body })

    await submit()

    expect(toastAdd).toHaveBeenCalledWith({ title: 'Enter a valid amount', color: 'error' })
    expect(submitBudgetEntry).not.toHaveBeenCalled()
  })

  it('submits a valid entry for the month, then closes', async () => {
    submitBudgetEntry.mockResolvedValue({})
    const wrapper = await mountSuspended(BudgetEntryModal, { props, attachTo: document.body })

    await setAmount('42.5')
    await submit()

    expect(submitBudgetEntry).toHaveBeenCalledWith(
      { ok: true, newCategory: null, entry: { categoryId: 'rent', userId: null, amount: 42.5, notes: null } },
      '2026-10-01'
    )
    expect(wrapper.emitted('created')).toHaveLength(1)
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('keeps the modal open and reports a failed save', async () => {
    submitBudgetEntry.mockRejectedValue(new Error('409'))
    const wrapper = await mountSuspended(BudgetEntryModal, { props, attachTo: document.body })

    await setAmount('10')
    await submit()

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ title: 'Could not add entry', color: 'error' }))
    expect(wrapper.emitted('update:open')).toBeUndefined()
  })
})
