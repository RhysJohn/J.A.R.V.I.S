<script setup lang="ts">
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { hasAnyAmount, type BucketTotals } from '../../logic/budget/buckets'
import { bucketDonutData } from '../../logic/budget/chart'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  totals: BucketTotals
  currency: string
}>()

const chartData = computed(() => bucketDonutData(props.totals, BUCKET_LABELS, BUCKET_CHART_COLORS))
const hasData = computed(() => hasAnyAmount(props.totals))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const },
    tooltip: {
      callbacks: {
        label: (context: { label: string; raw: unknown }) => `${context.label}: ${formatCurrency(context.raw as number, props.currency)}`
      }
    }
  }
}))
</script>

<template>
  <div class="h-64 flex items-center justify-center">
    <Doughnut v-if="hasData" :data="chartData" :options="chartOptions" />
    <p v-else class="text-sm text-gray-500">No budget entries for this month yet.</p>
  </div>
</template>
