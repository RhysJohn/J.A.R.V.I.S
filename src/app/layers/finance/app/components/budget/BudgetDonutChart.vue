<script setup lang="ts">
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import type { ExpenseBucket } from '#layers/finance/shared/schemas/budget'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  totals: Record<ExpenseBucket, number>
  currency: string
}>()

const chartData = computed(() => ({
  labels: BUCKET_ORDER.map((bucket) => BUCKET_LABELS[bucket]),
  datasets: [
    {
      data: BUCKET_ORDER.map((bucket) => props.totals[bucket]),
      backgroundColor: BUCKET_ORDER.map((bucket) => BUCKET_CHART_COLORS[bucket]),
      borderWidth: 0
    }
  ]
}))

const hasData = computed(() => BUCKET_ORDER.some((bucket) => props.totals[bucket] > 0))

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
