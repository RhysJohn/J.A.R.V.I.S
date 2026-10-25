import { describe, expect, it, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import BudgetPage from './index.vue'

// Chart.js needs a real canvas; the chart itself is covered by BudgetDonutChart.test.ts.
vi.mock('vue-chartjs', () => ({ Doughnut: { render: () => null } }))

registerEndpoint('/api/household', () => ({
  id: 'h1',
  name: 'Home',
  currency: 'GBP',
  users: [{ id: 'u1', displayName: 'Alex', email: 'alex@example.test' }]
}))

registerEndpoint('/api/budget/categories', () => [
  { id: 'rent', name: 'Rent', bucket: 'need', isArchived: false },
  { id: 'isa', name: 'ISA', bucket: 'saving', isArchived: false }
])

registerEndpoint('/api/budget/entries', () => [
  { id: 'e1', categoryId: 'rent', userId: null, amount: 800 },
  { id: 'e2', categoryId: 'isa', userId: 'u1', amount: 200 }
])

describe('budget page', () => {
  it('wires household, categories and entries into the summary and table', async () => {
    const wrapper = await mountSuspended(BudgetPage)

    // The page's useFetch calls aren't awaited, so data lands after mount.
    await vi.waitFor(() => expect(wrapper.find('[data-testid="grand-total"]').text()).toBe('£1,000.00'))
    expect(wrapper.find('h1').text()).toBe('Budget')
    expect(wrapper.find('[data-bucket="need"]').text()).toContain('£800.00')
    expect(wrapper.find('[data-bucket="need"]').text()).toContain('80% of total')
    expect(wrapper.find('[data-category="isa"] [data-column="u1"]').text()).toBe('£200.00')
    expect(wrapper.find('[data-testid="grand-total"]').text()).toBe('£1,000.00')
  })
})
