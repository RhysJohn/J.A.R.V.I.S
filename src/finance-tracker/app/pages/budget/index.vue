<script setup lang="ts">
const { data: household } = useHousehold()
const { data: categories, refresh: refreshCategories } = useBudgetCategories()

const selectedMonth = ref(currentMonthString())
const { data: entries, refresh: refreshEntries } = useBudgetEntries(selectedMonth)

const toast = useToast()

const currency = computed(() => household.value?.currency ?? 'GBP')
const members = computed(() => household.value?.users ?? [])

const bucketTotals = computed(() => {
  const totals = emptyBucketTotals()
  const categoryBuckets = new Map((categories.value ?? []).map((category) => [category.id, category.bucket]))
  for (const entry of entries.value ?? []) {
    const bucket = categoryBuckets.get(entry.categoryId)
    if (bucket) totals[bucket] += entry.amount
  }
  return totals
})

const isModalOpen = ref(false)
const prefill = ref<{ categoryId?: string; userId?: string | null } | null>(null)

function openAddEntry(payload?: { categoryId: string; userId: string | null }) {
  prefill.value = payload ?? null
  isModalOpen.value = true
}

function goToMonth(delta: number) {
  selectedMonth.value = shiftMonth(selectedMonth.value, delta)
}

async function handleUpdateEntry({ id, amount }: { id: string; amount: number }) {
  try {
    await updateBudgetEntry(id, { amount })
    await refreshEntries()
  } catch {
    toast.add({ title: 'Could not update entry', color: 'error' })
  }
}

async function handleDeleteEntry({ id }: { id: string }) {
  try {
    await deleteBudgetEntry(id)
    await refreshEntries()
  } catch {
    toast.add({ title: 'Could not remove entry', color: 'error' })
  }
}

async function handleArchiveCategory({ id }: { id: string }) {
  try {
    await updateBudgetCategory(id, { isArchived: true })
    await refreshCategories()
  } catch {
    toast.add({ title: 'Could not archive category', color: 'error' })
  }
}

async function handleCreated() {
  await Promise.all([refreshCategories(), refreshEntries()])
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Budget</h1>
      <UButton @click="openAddEntry()">+ Add entry</UButton>
    </div>

    <div class="flex items-center justify-center gap-4">
      <UButton color="neutral" variant="ghost" @click="goToMonth(-1)">&larr; Prev</UButton>
      <span class="font-medium">{{ formatMonthLabel(selectedMonth) }}</span>
      <UButton color="neutral" variant="ghost" @click="goToMonth(1)">Next &rarr;</UButton>
    </div>

    <BudgetBucketSummary :totals="bucketTotals" :currency="currency" />

    <UCard>
      <template #header>
        <h2 class="font-medium">Allocation</h2>
      </template>
      <BudgetDonutChart :totals="bucketTotals" :currency="currency" />
    </UCard>

    <UCard>
      <BudgetTable
        :categories="categories ?? []"
        :entries="entries ?? []"
        :members="members"
        :currency="currency"
        @add-entry="openAddEntry"
        @update-entry="handleUpdateEntry"
        @delete-entry="handleDeleteEntry"
        @archive-category="handleArchiveCategory"
      />
    </UCard>

    <BudgetEntryModal
      v-model:open="isModalOpen"
      :categories="categories ?? []"
      :members="members"
      :month="selectedMonth"
      :currency="currency"
      :prefill="prefill"
      @created="handleCreated"
    />
  </div>
</template>
