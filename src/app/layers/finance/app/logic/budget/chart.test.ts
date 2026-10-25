import { describe, expect, it } from 'vitest'
import { bucketDonutData } from './chart'

describe('bucketDonutData', () => {
  it('orders labels, values and colours by bucket', () => {
    const data = bucketDonutData(
      { need: 500, want: 300, saving: 200 },
      { need: 'Needs', want: 'Wants', saving: 'Savings' },
      { need: 'blue', want: 'amber', saving: 'green' }
    )
    expect(data.labels).toEqual(['Needs', 'Wants', 'Savings'])
    expect(data.datasets[0]).toEqual({ data: [500, 300, 200], backgroundColor: ['blue', 'amber', 'green'], borderWidth: 0 })
  })
})
