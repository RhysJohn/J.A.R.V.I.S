import { describe, expect, it } from 'vitest'
import { bucketStatus, bucketTotalsFor, hasAnyAmount, summariseBuckets } from './buckets'

const categories = [
  { id: 'rent', bucket: 'need' as const },
  { id: 'dining', bucket: 'want' as const },
  { id: 'isa', bucket: 'saving' as const }
]

describe('bucketTotalsFor', () => {
  it('sums entries into their category bucket', () => {
    const totals = bucketTotalsFor(categories, [
      { categoryId: 'rent', amount: 1000 },
      { categoryId: 'rent', amount: 200 },
      { categoryId: 'dining', amount: 150.5 },
      { categoryId: 'isa', amount: 300 }
    ])
    expect(totals).toEqual({ need: 1200, want: 150.5, saving: 300 })
  })

  it('ignores entries whose category is unknown (e.g. archived and filtered out)', () => {
    expect(bucketTotalsFor(categories, [{ categoryId: 'gone', amount: 99 }])).toEqual({ need: 0, want: 0, saving: 0 })
  })
})

describe('bucketStatus', () => {
  it('treats anything within 2 percentage points as on target', () => {
    expect(bucketStatus(0.019)).toBe('on-target')
    expect(bucketStatus(-0.019)).toBe('on-target')
  })

  it('reports over and under beyond the tolerance', () => {
    expect(bucketStatus(0.02)).toBe('over')
    expect(bucketStatus(-0.05)).toBe('under')
  })
})

describe('summariseBuckets', () => {
  it('computes each bucket share against the 50/30/20 targets', () => {
    const { rows, grandTotal } = summariseBuckets({ need: 600, want: 300, saving: 100 })
    expect(grandTotal).toBe(1000)
    expect(rows.map((row) => row.bucket)).toEqual(['need', 'want', 'saving'])

    const [need, want, saving] = rows
    expect(need).toMatchObject({ amount: 600, actualPercent: 0.6, target: 0.5, status: 'over' })
    expect(need!.delta).toBeCloseTo(0.1)
    expect(want).toMatchObject({ actualPercent: 0.3, target: 0.3, status: 'on-target' })
    expect(saving).toMatchObject({ actualPercent: 0.1, target: 0.2, status: 'under' })
  })

  it('returns zero shares instead of dividing by zero when there is no budget', () => {
    const { rows, grandTotal } = summariseBuckets({ need: 0, want: 0, saving: 0 })
    expect(grandTotal).toBe(0)
    expect(rows.every((row) => row.actualPercent === 0)).toBe(true)
  })
})

describe('hasAnyAmount', () => {
  it('is false only when every bucket is zero', () => {
    expect(hasAnyAmount({ need: 0, want: 0, saving: 0 })).toBe(false)
    expect(hasAnyAmount({ need: 0, want: 0, saving: 1 })).toBe(true)
  })
})
