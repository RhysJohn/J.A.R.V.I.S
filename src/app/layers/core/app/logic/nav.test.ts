import { describe, expect, it } from 'vitest'
import { sortNavLinks } from './nav'

describe('sortNavLinks', () => {
  it('orders links from every layer by their order value without mutating the input', () => {
    const links = [
      { label: 'Settings', to: '/settings', order: 1000 },
      { label: 'Budget', to: '/budget', order: 100 },
      { label: 'Dashboard', to: '/dashboard', order: 0 }
    ]
    expect(sortNavLinks(links).map((link) => link.label)).toEqual(['Dashboard', 'Budget', 'Settings'])
    expect(links[0]!.label).toBe('Settings')
  })
})
