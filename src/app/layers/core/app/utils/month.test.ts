import { describe, expect, it, vi } from 'vitest'
import { currentMonthString, formatMonthLabel, shiftMonth } from './month'

describe('shiftMonth', () => {
  it('moves across year boundaries in both directions', () => {
    expect(shiftMonth('2026-12-01', 1)).toBe('2027-01-01')
    expect(shiftMonth('2026-01-01', -1)).toBe('2025-12-01')
    expect(shiftMonth('2026-03-01', -15)).toBe('2024-12-01')
  })
})

describe('currentMonthString', () => {
  it('returns the first of the current month', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 25))
    expect(currentMonthString()).toBe('2026-10-01')
    vi.useRealTimers()
  })
})

describe('formatMonthLabel', () => {
  it('formats as a British month and year', () => {
    expect(formatMonthLabel('2026-10-01')).toBe('October 2026')
  })
})
