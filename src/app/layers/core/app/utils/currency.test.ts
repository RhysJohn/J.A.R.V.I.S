import { describe, expect, it } from 'vitest'
import { formatCurrency, formatPercent } from './currency'

describe('formatCurrency', () => {
  it('formats GBP by default and honours other currencies', () => {
    expect(formatCurrency(1234.5)).toBe('£1,234.50')
    expect(formatCurrency(10, 'EUR')).toBe('€10.00')
  })
})

describe('formatPercent', () => {
  it('rounds ratios to whole percentages', () => {
    expect(formatPercent(0.5)).toBe('50%')
    expect(formatPercent(0.126)).toBe('13%')
  })
})
