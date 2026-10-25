<script setup lang="ts">
import type { ExpenseBucket } from '#layers/finance/shared/schemas/budget'

interface CategoryRow {
  id: string
  name: string
  bucket: ExpenseBucket
}

interface Member {
  id: string
  displayName: string
}

interface EntryRow {
  id: string
  categoryId: string
  userId: string | null
  amount: number
}

const props = defineProps<{
  categories: CategoryRow[]
  entries: EntryRow[]
  members: Member[]
  currency: string
}>()

const emit = defineEmits<{
  'update-entry': [{ id: string; amount: number }]
  'delete-entry': [{ id: string }]
  'add-entry': [{ categoryId: string; userId: string | null }]
  'archive-category': [{ id: string }]
}>()

const columns = computed(() => [
  ...props.members.map((member) => ({ key: member.id, label: member.displayName, userId: member.id as string | null })),
  { key: 'joint', label: 'Joint', userId: null as string | null }
])

function entryFor(categoryId: string, userId: string | null) {
  return props.entries.find((entry) => entry.categoryId === categoryId && entry.userId === userId) ?? null
}

function rowTotal(categoryId: string) {
  return props.entries
    .filter((entry) => entry.categoryId === categoryId)
    .reduce((sum, entry) => sum + entry.amount, 0)
}

const groupedCategories = computed(() =>
  BUCKET_ORDER.map((bucket) => ({
    bucket,
    label: BUCKET_LABELS[bucket],
    categories: props.categories.filter((category) => category.bucket === bucket)
  })).filter((group) => group.categories.length > 0)
)

function bucketTotal(bucket: ExpenseBucket) {
  const categoryIds = new Set(props.categories.filter((category) => category.bucket === bucket).map((category) => category.id))
  return props.entries
    .filter((entry) => categoryIds.has(entry.categoryId))
    .reduce((sum, entry) => sum + entry.amount, 0)
}

const grandTotal = computed(() => props.entries.reduce((sum, entry) => sum + entry.amount, 0))

const editingId = ref<string | null>(null)
// Vue's v-model on <input type="number"> coerces valid input to a Number at runtime
// (looseToNumber), even though this ref is declared as a string — normalize with
// String() before calling .trim(), or it throws once a numeric value is typed.
const editingValue = ref<string | number>('')

function startEdit(entry: EntryRow) {
  editingId.value = entry.id
  editingValue.value = String(entry.amount)
}

function cancelEdit() {
  editingId.value = null
  editingValue.value = ''
}

function commitEdit(entry: EntryRow) {
  if (editingId.value !== entry.id) return
  const trimmed = String(editingValue.value).trim()
  if (trimmed === '') {
    emit('delete-entry', { id: entry.id })
  } else {
    const amount = Number(trimmed)
    if (!Number.isNaN(amount) && amount >= 0 && amount !== entry.amount) {
      emit('update-entry', { id: entry.id, amount })
    }
  }
  cancelEdit()
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr class="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
          <th class="py-2 pr-4 font-medium">Category</th>
          <th v-for="column in columns" :key="column.key" class="py-2 px-2 font-medium text-right">{{ column.label }}</th>
          <th class="py-2 pl-2 font-medium text-right">Total</th>
          <th class="w-16" />
        </tr>
      </thead>
      <tbody>
        <template v-for="group in groupedCategories" :key="group.bucket">
          <tr>
            <td :colspan="columns.length + 3" class="pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {{ group.label }}
            </td>
          </tr>
          <tr v-for="category in group.categories" :key="category.id" class="border-b border-gray-100 dark:border-gray-900">
            <td class="py-2 pr-4">{{ category.name }}</td>
            <td v-for="column in columns" :key="column.key" class="py-2 px-2 text-right">
              <template v-if="entryFor(category.id, column.userId)">
                <input
                  v-if="editingId === entryFor(category.id, column.userId)!.id"
                  v-model="editingValue"
                  type="number"
                  step="0.01"
                  autofocus
                  class="w-24 text-right rounded border border-(--ui-primary) bg-transparent px-1 py-0.5 focus:outline-none"
                  @blur="commitEdit(entryFor(category.id, column.userId)!)"
                  @keydown.enter="commitEdit(entryFor(category.id, column.userId)!)"
                  @keydown.escape="cancelEdit"
                />
                <button
                  v-else
                  type="button"
                  class="hover:underline"
                  @click="startEdit(entryFor(category.id, column.userId)!)"
                >
                  {{ formatCurrency(entryFor(category.id, column.userId)!.amount, currency) }}
                </button>
              </template>
              <button
                v-else
                type="button"
                class="text-gray-300 hover:text-gray-500 dark:text-gray-700 dark:hover:text-gray-400"
                @click="emit('add-entry', { categoryId: category.id, userId: column.userId })"
              >
                +
              </button>
            </td>
            <td class="py-2 pl-2 text-right font-medium">{{ formatCurrency(rowTotal(category.id), currency) }}</td>
            <td class="text-right">
              <UButton size="xs" color="neutral" variant="ghost" @click="emit('archive-category', { id: category.id })">
                Archive
              </UButton>
            </td>
          </tr>
          <tr class="border-b border-gray-200 dark:border-gray-800 font-medium">
            <td class="py-2 pr-4">{{ group.label }} total</td>
            <td v-for="column in columns" :key="column.key" />
            <td class="py-2 pl-2 text-right">{{ formatCurrency(bucketTotal(group.bucket), currency) }}</td>
            <td />
          </tr>
        </template>
      </tbody>
      <tfoot>
        <tr class="font-semibold text-base">
          <td class="py-3 pr-4">Grand total</td>
          <td v-for="column in columns" :key="column.key" />
          <td class="py-3 pl-2 text-right">{{ formatCurrency(grandTotal, currency) }}</td>
          <td />
        </tr>
      </tfoot>
    </table>
  </div>
</template>
