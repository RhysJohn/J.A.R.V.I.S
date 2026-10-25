import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BudgetBucketSummary from './BudgetBucketSummary.vue'

describe('BudgetBucketSummary', () => {
  it('renders a card per bucket with amount, share and target', async () => {
    const wrapper = await mountSuspended(BudgetBucketSummary, {
      props: { totals: { need: 600, want: 300, saving: 100 }, currency: 'GBP' }
    })

    const needs = wrapper.find('[data-bucket="need"]')
    expect(needs.text()).toContain('Needs')
    expect(needs.text()).toContain('50% target')
    expect(needs.text()).toContain('£600.00')
    expect(needs.text()).toContain('60% of total')
    expect(needs.find('[data-testid="delta"]').text()).toBe('(+10% vs target)')
  })

  it('colours the delta by status', async () => {
    const wrapper = await mountSuspended(BudgetBucketSummary, {
      props: { totals: { need: 600, want: 300, saving: 100 }, currency: 'GBP' }
    })

    expect(wrapper.find('[data-bucket="need"] [data-testid="delta"]').classes()).toContain('text-amber-600')
    expect(wrapper.find('[data-bucket="want"] [data-testid="delta"]').classes()).toContain('text-gray-500')
    expect(wrapper.find('[data-bucket="saving"] [data-testid="delta"]').classes()).toContain('text-emerald-600')
  })

  it('hides the delta when nothing is budgeted', async () => {
    const wrapper = await mountSuspended(BudgetBucketSummary, {
      props: { totals: { need: 0, want: 0, saving: 0 }, currency: 'GBP' }
    })

    expect(wrapper.find('[data-testid="delta"]').exists()).toBe(false)
  })
})
