import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BudgetTable from './BudgetTable.vue'

const props = {
  currency: 'GBP',
  members: [
    { id: 'u1', displayName: 'Alex' },
    { id: 'u2', displayName: 'Sam' }
  ],
  categories: [
    { id: 'rent', name: 'Rent', bucket: 'need' as const },
    { id: 'isa', name: 'ISA', bucket: 'saving' as const }
  ],
  entries: [
    { id: 'e1', categoryId: 'rent', userId: null, amount: 1200 },
    { id: 'e2', categoryId: 'isa', userId: 'u1', amount: 250 }
  ]
}

const cell = (category: string, column: string) => `[data-category="${category}"] [data-column="${column}"]`

describe('BudgetTable', () => {
  it('renders a column per member plus joint, and the totals', async () => {
    const wrapper = await mountSuspended(BudgetTable, { props })

    expect(wrapper.findAll('thead th').map((th) => th.text())).toEqual(['Category', 'Alex', 'Sam', 'Joint', 'Total', ''])
    expect(wrapper.find(cell('rent', 'joint')).text()).toBe('£1,200.00')
    expect(wrapper.find('[data-testid="bucket-total-need"]').text()).toBe('£1,200.00')
    expect(wrapper.find('[data-testid="grand-total"]').text()).toBe('£1,450.00')
  })

  it('emits add-entry from an empty cell with that person', async () => {
    const wrapper = await mountSuspended(BudgetTable, { props })

    await wrapper.find(`${cell('rent', 'u2')} button`).trigger('click')
    expect(wrapper.emitted('add-entry')).toEqual([[{ categoryId: 'rent', userId: 'u2' }]])
  })

  it('edits an amount inline and emits update-entry', async () => {
    const wrapper = await mountSuspended(BudgetTable, { props })

    await wrapper.find(`${cell('isa', 'u1')} button`).trigger('click')
    const input = wrapper.find(`${cell('isa', 'u1')} input`)
    await input.setValue('300')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update-entry')).toEqual([[{ id: 'e2', amount: 300 }]])
    expect(wrapper.find(`${cell('isa', 'u1')} input`).exists()).toBe(false)
  })

  it('emits delete-entry when an amount is cleared', async () => {
    const wrapper = await mountSuspended(BudgetTable, { props })

    await wrapper.find(`${cell('rent', 'joint')} button`).trigger('click')
    const input = wrapper.find(`${cell('rent', 'joint')} input`)
    await input.setValue('')
    await input.trigger('blur')

    expect(wrapper.emitted('delete-entry')).toEqual([[{ id: 'e1' }]])
  })

  it('emits archive-category from the row action', async () => {
    const wrapper = await mountSuspended(BudgetTable, { props })

    const archive = wrapper.findAll('[data-category="isa"] button').find((button) => button.text() === 'Archive')!
    await archive.trigger('click')
    expect(wrapper.emitted('archive-category')).toEqual([[{ id: 'isa' }]])
  })
})
