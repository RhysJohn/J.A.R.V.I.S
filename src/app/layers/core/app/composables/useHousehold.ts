export function useHousehold() {
  return useFetch('/api/household', { key: 'household' })
}
