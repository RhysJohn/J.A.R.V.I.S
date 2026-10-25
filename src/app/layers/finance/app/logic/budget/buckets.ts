import type { ExpenseBucket } from '#layers/finance/shared/schemas/budget'

export type BucketTotals = Record<ExpenseBucket, number>

export const BUCKET_ORDER: ExpenseBucket[] = ['need', 'want', 'saving']

// The 50/30/20 rule this app is built around.
export const BUCKET_TARGETS: BucketTotals = {
  need: 0.5,
  want: 0.3,
  saving: 0.2
}

// A share within ±2 percentage points of its target counts as on target.
export const ON_TARGET_TOLERANCE = 0.02

export type BucketStatus = 'on-target' | 'over' | 'under'

export interface BucketSummaryRow {
  bucket: ExpenseBucket
  amount: number
  actualPercent: number
  target: number
  delta: number
  status: BucketStatus
}

export function emptyBucketTotals(): BucketTotals {
  return { need: 0, want: 0, saving: 0 }
}

export function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0)
}

export function bucketTotalsFor(
  categories: { id: string; bucket: ExpenseBucket }[],
  entries: { categoryId: string; amount: number }[]
): BucketTotals {
  const totals = emptyBucketTotals()
  const categoryBuckets = new Map(categories.map((category) => [category.id, category.bucket]))
  for (const entry of entries) {
    const bucket = categoryBuckets.get(entry.categoryId)
    if (bucket) totals[bucket] += entry.amount
  }
  return totals
}

export function hasAnyAmount(totals: BucketTotals): boolean {
  return BUCKET_ORDER.some((bucket) => totals[bucket] > 0)
}

export function bucketStatus(delta: number): BucketStatus {
  if (Math.abs(delta) < ON_TARGET_TOLERANCE) return 'on-target'
  return delta > 0 ? 'over' : 'under'
}

export function summariseBuckets(totals: BucketTotals): { rows: BucketSummaryRow[]; grandTotal: number } {
  const grandTotal = BUCKET_ORDER.reduce((sum, bucket) => sum + totals[bucket], 0)
  const rows = BUCKET_ORDER.map((bucket) => {
    const amount = totals[bucket]
    const actualPercent = grandTotal > 0 ? amount / grandTotal : 0
    const target = BUCKET_TARGETS[bucket]
    const delta = actualPercent - target
    return { bucket, amount, actualPercent, target, delta, status: bucketStatus(delta) }
  })
  return { rows, grandTotal }
}
