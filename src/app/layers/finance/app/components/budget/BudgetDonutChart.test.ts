import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BudgetDonutChart from './BudgetDonutChart.vue'

// Chart.js needs a real canvas, so the chart is replaced with a stub that exposes its data.
vi.mock('vue-chartjs', () => ({
  Doughnut: defineComponent({
    props: { data: { type: Object, required: true }, options: { type: Object, required: true } },
    setup: (props) => () => h('div', { 'data-testid': 'doughnut', 'data-values': JSON.stringify(props.data.datasets[0].data) })
  })
}))

describe('BudgetDonutChart', () => {
  it('shows an empty state when nothing is budgeted', async () => {
    const wrapper = await mountSuspended(BudgetDonutChart, {
      props: { totals: { need: 0, want: 0, saving: 0 }, currency: 'GBP' }
    })

    expect(wrapper.text()).toContain('No budget entries for this month yet.')
    expect(wrapper.find('[data-testid="doughnut"]').exists()).toBe(false)
  })

  it('passes bucket totals to the chart in bucket order', async () => {
    const wrapper = await mountSuspended(BudgetDonutChart, {
      props: { totals: { need: 500, want: 300, saving: 200 }, currency: 'GBP' }
    })

    expect(wrapper.find('[data-testid="doughnut"]').attributes('data-values')).toBe('[500,300,200]')
  })
})
