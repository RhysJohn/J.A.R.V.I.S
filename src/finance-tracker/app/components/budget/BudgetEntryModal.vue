<script setup lang="ts">
import type { ExpenseBucket } from '~~/shared/schemas/budget'

const props = defineProps<{
  open: boolean
  categories: { id: string; name: string; bucket: ExpenseBucket }[]
  members: { id: string; displayName: string }[]
  month: string
  currency: string
  prefill?: { categoryId?: string | null; userId?: string | null } | null
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  created: []
}>()

const toast = useToast()
const pending = ref(false)

const isNewCategory = ref(false)
const categoryId = ref<string | null>(null)
const newCategoryName = ref('')
const newCategoryBucket = ref<ExpenseBucket>('need')
const personKey = ref('joint')
const amount = ref<number | null>(null)
const notes = ref('')

const categoryItems = computed(() =>
  props.categories.map((category) => ({ label: `${category.name} (${BUCKET_LABELS[category.bucket]})`, id: category.id }))
)

const personItems = computed(() => [
  { label: 'Joint', id: 'joint' },
  ...props.members.map((member) => ({ label: member.displayName, id: member.id }))
])

const bucketItems = BUCKET_ORDER.map((bucket) => ({ label: BUCKET_LABELS[bucket], id: bucket }))

function resetForm() {
  isNewCategory.value = props.categories.length === 0
  categoryId.value = props.prefill?.categoryId ?? props.categories[0]?.id ?? null
  newCategoryName.value = ''
  newCategoryBucket.value = 'need'
  personKey.value = props.prefill?.userId ?? 'joint'
  amount.value = null
  notes.value = ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  }
)

async function onSubmit() {
  if (amount.value === null || Number.isNaN(amount.value) || amount.value < 0) {
    toast.add({ title: 'Enter a valid amount', color: 'error' })
    return
  }

  pending.value = true
  try {
    let resolvedCategoryId = categoryId.value

    if (isNewCategory.value) {
      if (!newCategoryName.value.trim()) {
        toast.add({ title: 'Enter a category name', color: 'error' })
        return
      }
      const category = await createBudgetCategory({ name: newCategoryName.value, bucket: newCategoryBucket.value })
      resolvedCategoryId = category.id
    }

    if (!resolvedCategoryId) {
      toast.add({ title: 'Select a category', color: 'error' })
      return
    }

    await createBudgetEntry({
      categoryId: resolvedCategoryId,
      userId: personKey.value === 'joint' ? null : personKey.value,
      month: props.month,
      amount: amount.value,
      notes: notes.value.trim() || null
    })

    toast.add({ title: 'Budget entry added', color: 'success' })
    emit('created')
    emit('update:open', false)
  } catch {
    toast.add({ title: 'Could not add entry', description: 'Check the details and try again.', color: 'error' })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UModal :open="open" title="Add budget entry" @update:open="emit('update:open', $event)">
    <template #body>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <UFormField label="Category">
          <div class="space-y-2">
            <USelectMenu
              v-if="!isNewCategory"
              v-model="categoryId"
              :items="categoryItems"
              value-key="id"
              label-key="label"
              placeholder="Select a category"
              class="w-full"
            />
            <div v-else class="grid grid-cols-2 gap-2">
              <UInput v-model="newCategoryName" placeholder="Category name" class="col-span-2" />
              <USelectMenu v-model="newCategoryBucket" :items="bucketItems" value-key="id" label-key="label" class="col-span-2" />
            </div>
            <UButton size="xs" color="neutral" variant="ghost" class="px-0" @click="isNewCategory = !isNewCategory">
              {{ isNewCategory ? 'Use an existing category' : '+ Create a new category' }}
            </UButton>
          </div>
        </UFormField>

        <UFormField label="Person">
          <USelectMenu v-model="personKey" :items="personItems" value-key="id" label-key="label" class="w-full" />
        </UFormField>

        <UFormField label="Month">
          <UInput :model-value="formatMonthLabel(month)" disabled class="w-full" />
        </UFormField>

        <UFormField label="Amount">
          <UInput v-model.number="amount" type="number" step="0.01" min="0" :placeholder="formatCurrency(0, currency)" class="w-full" />
        </UFormField>

        <UFormField label="Notes (optional)">
          <UInput v-model="notes" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="emit('update:open', false)">Cancel</UButton>
          <UButton type="submit" :loading="pending">Add entry</UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>
