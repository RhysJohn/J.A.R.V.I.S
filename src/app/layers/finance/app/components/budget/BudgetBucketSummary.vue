<script setup lang="ts">
import { summariseBuckets, type BucketTotals } from '../../logic/budget/buckets'

const props = defineProps<{
  totals: BucketTotals
  currency: string
}>()

const summary = computed(() => summariseBuckets(props.totals))
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <UCard v-for="row in summary.rows" :key="row.bucket" :data-bucket="row.bucket">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">{{ BUCKET_LABELS[row.bucket] }}</span>
          <UBadge :color="BUCKET_UI_COLORS[row.bucket]" variant="subtle">{{ formatPercent(row.target) }} target</UBadge>
        </div>
      </template>

      <div class="space-y-1">
        <p class="text-2xl font-semibold">{{ formatCurrency(row.amount, currency) }}</p>
        <p class="text-sm text-gray-500">
          {{ formatPercent(row.actualPercent) }} of total
          <span v-if="summary.grandTotal > 0" data-testid="delta" :class="BUCKET_STATUS_CLASSES[row.status]">
            ({{ row.delta > 0 ? '+' : '' }}{{ formatPercent(row.delta) }} vs target)
          </span>
        </p>
      </div>
    </UCard>
  </div>
</template>
