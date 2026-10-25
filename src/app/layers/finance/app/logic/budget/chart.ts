import type { ExpenseBucket } from '#layers/finance/shared/schemas/budget'
import { BUCKET_ORDER, type BucketTotals } from './buckets'

export interface DonutChartData {
  labels: string[]
  datasets: { data: number[]; backgroundColor: string[]; borderWidth: number }[]
}

export function bucketDonutData(
  totals: BucketTotals,
  labels: Record<ExpenseBucket, string>,
  colors: Record<ExpenseBucket, string>
): DonutChartData {
  return {
    labels: BUCKET_ORDER.map((bucket) => labels[bucket]),
    datasets: [
      {
        data: BUCKET_ORDER.map((bucket) => totals[bucket]),
        backgroundColor: BUCKET_ORDER.map((bucket) => colors[bucket]),
        borderWidth: 0
      }
    ]
  }
}
