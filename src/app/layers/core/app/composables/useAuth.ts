import type { ChangePasswordInput, LoginInput } from '#layers/core/shared/schemas/auth'

export function loginRequest(input: LoginInput) {
  return $fetch('/api/auth/login', { method: 'POST', body: input })
}

export function logoutRequest() {
  return $fetch('/api/auth/logout', { method: 'POST' })
}

export function changePasswordRequest(input: ChangePasswordInput) {
  return $fetch('/api/settings/change-password', { method: 'POST', body: input })
}
