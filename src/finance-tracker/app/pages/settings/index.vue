<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { changePasswordSchema, type ChangePasswordInput } from '~~/shared/schemas/auth'

const { data: household } = useHousehold()
const toast = useToast()

const state = reactive<ChangePasswordInput>({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const pending = ref(false)

async function onSubmit(event: FormSubmitEvent<ChangePasswordInput>) {
  pending.value = true
  try {
    await $fetch('/api/settings/change-password', { method: 'POST', body: event.data })
    toast.add({ title: 'Password updated', color: 'success' })
    state.currentPassword = ''
    state.newPassword = ''
    state.confirmNewPassword = ''
  } catch {
    toast.add({ title: 'Could not update password', description: 'Check your current password and try again.', color: 'error' })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-md">
    <h1 class="text-xl font-semibold">Settings</h1>

    <UCard v-if="household">
      <template #header>
        <h2 class="font-medium">Household</h2>
      </template>
      <dl class="text-sm space-y-1">
        <div class="flex justify-between">
          <dt class="text-gray-500">Name</dt>
          <dd>{{ household.name }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-gray-500">Currency</dt>
          <dd>{{ household.currency }}</dd>
        </div>
      </dl>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-medium">Change password</h2>
      </template>

      <UForm :schema="changePasswordSchema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Current password" name="currentPassword">
          <UInput v-model="state.currentPassword" type="password" autocomplete="current-password" class="w-full" />
        </UFormField>

        <UFormField label="New password" name="newPassword">
          <UInput v-model="state.newPassword" type="password" autocomplete="new-password" class="w-full" />
        </UFormField>

        <UFormField label="Confirm new password" name="confirmNewPassword">
          <UInput v-model="state.confirmNewPassword" type="password" autocomplete="new-password" class="w-full" />
        </UFormField>

        <UButton type="submit" :loading="pending">Update password</UButton>
      </UForm>
    </UCard>
  </div>
</template>
