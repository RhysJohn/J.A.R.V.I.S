<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { loginSchema, type LoginInput } from '~~/shared/schemas/auth'

definePageMeta({ layout: false })

const { fetch: refreshSession } = useUserSession()
const toast = useToast()

const state = reactive<LoginInput>({
  email: '',
  password: ''
})

const pending = ref(false)

async function onSubmit(event: FormSubmitEvent<LoginInput>) {
  pending.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: event.data })
    await refreshSession()
    await navigateTo('/dashboard')
  } catch {
    toast.add({ title: 'Login failed', description: 'Check your email and password.', color: 'error' })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h1 class="text-lg font-semibold">Sign in</h1>
      </template>

      <UForm :schema="loginSchema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" autocomplete="email" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" autocomplete="current-password" class="w-full" />
        </UFormField>

        <UButton type="submit" block :loading="pending">
          Sign in
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
