import type { ExpenseBucket } from '#layers/finance/shared/schemas/budget'
import type { BucketStatus } from '../logic/budget/buckets'

// Presentation constants for budget buckets. The rules themselves (order, 50/30/20 targets,
// totals) live in app/logic/budget.

export const BUCKET_LABELS: Record<ExpenseBucket, string> = {
  need: 'Needs',
  want: 'Wants',
  saving: 'Savings'
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

export const BUCKET_STATUS_CLASSES: Record<BucketStatus, string> = {
  'on-target': 'text-gray-500',
  over: 'text-amber-600',
  under: 'text-emerald-600'
}
