<script setup lang="ts">
import { BUCKET_ORDER } from '../../logic/budget/buckets'
import {
  categoryOptions,
  initialEntryForm,
  personOptions,
  prepareEntrySubmission,
  type EntryFormPrefill
} from '../../logic/budget/entryForm'
import type { BudgetCategory, BudgetMember } from '../../logic/budget/table'

const props = defineProps<{
  open: boolean
  categories: BudgetCategory[]
  members: BudgetMember[]
  month: string
  currency: string
  prefill?: EntryFormPrefill | null
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  created: []
}>()

const toast = useToast()
const pending = ref(false)
const form = reactive(initialEntryForm(props.categories, props.prefill))

const categoryItems = computed(() => categoryOptions(props.categories, BUCKET_LABELS))
const personItems = computed(() => personOptions(props.members))
const bucketItems = BUCKET_ORDER.map((bucket) => ({ id: bucket, label: BUCKET_LABELS[bucket] }))

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) Object.assign(form, initialEntryForm(props.categories, props.prefill))
  }
)

function close() {
  emit('update:open', false)
}

function toggleNewCategory() {
  form.isNewCategory = !form.isNewCategory
}

async function onSubmit() {
  const submission = prepareEntrySubmission(form)
  if (!submission.ok) {
    toast.add({ title: submission.error, color: 'error' })
    return
  }

  pending.value = true
  try {
    await submitBudgetEntry(submission, props.month)
    toast.add({ title: 'Budget entry added', color: 'success' })
    emit('created')
    close()
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
      <form class="space-y-4" data-testid="entry-form" @submit.prevent="onSubmit">
        <UFormField label="Category">
          <div class="space-y-2">
            <USelectMenu
              v-if="!form.isNewCategory"
              v-model="form.categoryId"
              :items="categoryItems"
              value-key="id"
              label-key="label"
              placeholder="Select a category"
              class="w-full"
            />
            <div v-else class="grid grid-cols-2 gap-2">
              <UInput v-model="form.newCategoryName" placeholder="Category name" class="col-span-2" />
              <USelectMenu v-model="form.newCategoryBucket" :items="bucketItems" value-key="id" label-key="label" class="col-span-2" />
            </div>
            <UButton size="xs" color="neutral" variant="ghost" class="px-0" @click="toggleNewCategory">
              {{ form.isNewCategory ? 'Use an existing category' : '+ Create a new category' }}
            </UButton>
          </div>
        </UFormField>

        <UFormField label="Person">
          <USelectMenu v-model="form.personKey" :items="personItems" value-key="id" label-key="label" class="w-full" />
        </UFormField>

        <UFormField label="Month">
          <UInput :model-value="formatMonthLabel(month)" disabled class="w-full" />
        </UFormField>

        <UFormField label="Amount">
          <UInput v-model.number="form.amount" type="number" step="0.01" min="0" :placeholder="formatCurrency(0, currency)" class="w-full" />
        </UFormField>

        <UFormField label="Notes (optional)">
          <UInput v-model="form.notes" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="close">Cancel</UButton>
          <UButton type="submit" :loading="pending">Add entry</UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>
