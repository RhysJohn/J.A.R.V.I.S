<script setup lang="ts">
import type { ExpenseBucket } from '~~/shared/schemas/budget'

const props = defineProps<{
  totals: Record<ExpenseBucket, number>
  currency: string
}>()

const grandTotal = computed(() => BUCKET_ORDER.reduce((sum, bucket) => sum + props.totals[bucket], 0))

const rows = computed(() =>
  BUCKET_ORDER.map((bucket) => {
    const amount = props.totals[bucket]
    const actualPercent = grandTotal.value > 0 ? amount / grandTotal.value : 0
    const target = BUCKET_TARGETS[bucket]
    return {
      bucket,
      label: BUCKET_LABELS[bucket],
      color: BUCKET_UI_COLORS[bucket],
      amount,
      actualPercent,
      target,
      delta: actualPercent - target
    }
  })
)
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <UCard v-for="row in rows" :key="row.bucket">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">{{ row.label }}</span>
          <UBadge :color="row.color" variant="subtle">{{ formatPercent(row.target) }} target</UBadge>
        </div>
      </template>

      <div class="space-y-1">
        <p class="text-2xl font-semibold">{{ formatCurrency(row.amount, currency) }}</p>
        <p class="text-sm text-gray-500">
          {{ formatPercent(row.actualPercent) }} of total
          <span v-if="grandTotal > 0" :class="Math.abs(row.delta) < 0.02 ? 'text-gray-500' : row.delta > 0 ? 'text-amber-600' : 'text-emerald-600'">
            ({{ row.delta > 0 ? '+' : '' }}{{ formatPercent(row.delta) }} vs target)
          </span>
        </p>
      </div>
    </UCard>
  </div>
</template>
