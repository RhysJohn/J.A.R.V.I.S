<script setup lang="ts">
import {
  buildBudgetTable,
  resolveAmountEdit,
  type BudgetCategory,
  type BudgetEntry,
  type BudgetMember
} from '../../logic/budget/table'

const props = defineProps<{
  categories: BudgetCategory[]
  entries: BudgetEntry[]
  members: BudgetMember[]
  currency: string
}>()

const emit = defineEmits<{
  'update-entry': [{ id: string; amount: number }]
  'delete-entry': [{ id: string }]
  'add-entry': [{ categoryId: string; userId: string | null }]
  'archive-category': [{ id: string }]
}>()

const table = computed(() => buildBudgetTable(props.categories, props.entries, props.members))

const editingId = ref<string | null>(null)
const editingValue = ref<string | number>('')

function startEdit(entry: BudgetEntry) {
  editingId.value = entry.id
  editingValue.value = String(entry.amount)
}

function cancelEdit() {
  editingId.value = null
  editingValue.value = ''
}

function commitEdit(entry: BudgetEntry) {
  if (editingId.value !== entry.id) return
  const edit = resolveAmountEdit(editingValue.value, entry.amount)
  if (edit.kind === 'delete') emit('delete-entry', { id: entry.id })
  if (edit.kind === 'update') emit('update-entry', { id: entry.id, amount: edit.amount })
  cancelEdit()
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr class="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
          <th class="py-2 pr-4 font-medium">Category</th>
          <th v-for="column in table.columns" :key="column.key" class="py-2 px-2 font-medium text-right">{{ column.label }}</th>
          <th class="py-2 pl-2 font-medium text-right">Total</th>
          <th class="w-16" />
        </tr>
      </thead>
      <tbody>
        <template v-for="group in table.groups" :key="group.bucket">
          <tr>
            <td :colspan="table.columns.length + 3" class="pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {{ BUCKET_LABELS[group.bucket] }}
            </td>
          </tr>
          <tr v-for="row in group.rows" :key="row.category.id" :data-category="row.category.id" class="border-b border-gray-100 dark:border-gray-900">
            <td class="py-2 pr-4">{{ row.category.name }}</td>
            <td v-for="cell in row.cells" :key="cell.column.key" :data-column="cell.column.key" class="py-2 px-2 text-right">
              <template v-if="cell.entry">
                <input
                  v-if="editingId === cell.entry.id"
                  v-model="editingValue"
                  type="number"
                  step="0.01"
                  autofocus
                  class="w-24 text-right rounded border border-(--ui-primary) bg-transparent px-1 py-0.5 focus:outline-none"
                  @blur="commitEdit(cell.entry)"
                  @keydown.enter="commitEdit(cell.entry)"
                  @keydown.escape="cancelEdit"
                />
                <button v-else type="button" class="hover:underline" @click="startEdit(cell.entry)">
                  {{ formatCurrency(cell.entry.amount, currency) }}
                </button>
              </template>
              <button
                v-else
                type="button"
                class="text-gray-300 hover:text-gray-500 dark:text-gray-700 dark:hover:text-gray-400"
                @click="emit('add-entry', { categoryId: row.category.id, userId: cell.column.userId })"
              >
                +
              </button>
            </td>
            <td class="py-2 pl-2 text-right font-medium" data-testid="row-total">{{ formatCurrency(row.total, currency) }}</td>
            <td class="text-right">
              <UButton size="xs" color="neutral" variant="ghost" @click="emit('archive-category', { id: row.category.id })">
                Archive
              </UButton>
            </td>
          </tr>
          <tr class="border-b border-gray-200 dark:border-gray-800 font-medium">
            <td class="py-2 pr-4">{{ BUCKET_LABELS[group.bucket] }} total</td>
            <td v-for="column in table.columns" :key="column.key" />
            <td class="py-2 pl-2 text-right" :data-testid="`bucket-total-${group.bucket}`">{{ formatCurrency(group.total, currency) }}</td>
            <td />
          </tr>
        </template>
      </tbody>
      <tfoot>
        <tr class="font-semibold text-base">
          <td class="py-3 pr-4">Grand total</td>
          <td v-for="column in table.columns" :key="column.key" />
          <td class="py-3 pl-2 text-right" data-testid="grand-total">{{ formatCurrency(table.grandTotal, currency) }}</td>
          <td />
        </tr>
      </tfoot>
    </table>
  </div>
</template>
