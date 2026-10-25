function toMonthString(year: number, monthIndex: number): string {
  const normalizedYear = year + Math.floor(monthIndex / 12)
  const normalizedMonth = ((monthIndex % 12) + 12) % 12
  return `${normalizedYear}-${String(normalizedMonth + 1).padStart(2, '0')}-01`
}

export function currentMonthString(): string {
  const now = new Date()
  return toMonthString(now.getFullYear(), now.getMonth())
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNum] = month.split('-').map(Number) as [number, number]
  return toMonthString(year, monthNum - 1 + delta)
}

export function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number) as [number, number]
  const date = new Date(Date.UTC(year, monthNum - 1, 1))
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}
