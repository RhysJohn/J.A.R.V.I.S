// `nav` arrays from every layer's app.config are concatenated by Nuxt, so each feature layer
// registers its own links and the core layout renders them sorted by `order`.
export default defineAppConfig({
  nav: [
    { label: 'Dashboard', to: '/dashboard', order: 0 },
    { label: 'Settings', to: '/settings', order: 1000 }
  ]
})
