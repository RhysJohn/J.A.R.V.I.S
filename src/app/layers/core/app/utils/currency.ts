export function formatCurrency(amount: number, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)
}

export function formatPercent(ratio: number) {
  return new Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 0 }).format(ratio)
}
