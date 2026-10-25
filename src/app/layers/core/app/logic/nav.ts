export interface NavLink {
  label: string
  to: string
  order: number
}

// Nav links are contributed by every layer's app.config and merged by Nuxt in layer order,
// so they're sorted here rather than relying on merge order.
export function sortNavLinks(links: NavLink[]): NavLink[] {
  return [...links].sort((a, b) => a.order - b.order)
}
