<script setup lang="ts">
const { user, clear } = useUserSession()

const links = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Budget', to: '/budget' },
  { label: 'Pension', to: '/pension' },
  { label: 'Mortgages', to: '/mortgages' },
  { label: 'Settings', to: '/settings' }
]

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <nav class="flex items-center gap-4">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            active-class="text-primary"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">{{ user?.displayName }}</span>
          <UButton size="sm" color="neutral" variant="ghost" @click="logout">Log out</UButton>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-6">
      <slot />
    </main>
  </div>
</template>
