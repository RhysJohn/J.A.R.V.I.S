import type { ExpenseBucket } from '#layers/finance/shared/schemas/budget'

export const BUCKET_ORDER: ExpenseBucket[] = ['need', 'want', 'saving']

export const BUCKET_LABELS: Record<ExpenseBucket, string> = {
  need: 'Needs',
  want: 'Wants',
  saving: 'Savings'
}

// The 50/30/20 rule this app is built around.
export const BUCKET_TARGETS: Record<ExpenseBucket, number> = {
  need: 0.5,
  want: 0.3,
  saving: 0.2
}

export const BUCKET_CHART_COLORS: Record<ExpenseBucket, string> = {
  need: '#3b82f6',
  want: '#f59e0b',
  saving: '#10b981'
}

export const BUCKET_UI_COLORS: Record<ExpenseBucket, 'primary' | 'warning' | 'success'> = {
  need: 'primary',
  want: 'warning',
  saving: 'success'
}

export function emptyBucketTotals(): Record<ExpenseBucket, number> {
  return { need: 0, want: 0, saving: 0 }
}
