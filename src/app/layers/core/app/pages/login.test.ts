import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LoginPage from './login.vue'

describe('login page', () => {
  it('renders the sign-in form with email and password fields', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.find('h1').text()).toBe('Sign in')
    expect(wrapper.find('input[type="email"]').attributes('autocomplete')).toBe('email')
    expect(wrapper.find('input[type="password"]').attributes('autocomplete')).toBe('current-password')
    expect(wrapper.find('button[type="submit"]').text()).toBe('Sign in')
  })
})
