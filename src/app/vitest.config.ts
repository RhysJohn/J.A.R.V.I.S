import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

// Unit tests run in plain Node (fast, no Nuxt), so the `#layers/<name>` aliases Nuxt
// normally provides are recreated here for every layer folder.
const layersDir = fileURLToPath(new URL('./layers', import.meta.url))
const layerAliases = Object.fromEntries(
  readdirSync(layersDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => [`#layers/${entry.name}`, `${layersDir}/${entry.name}`])
)

export default defineConfig({
  test: {
    projects: [
      {
        // Business logic: pure TypeScript in app/logic, app/utils and shared/.
        resolve: { alias: layerAliases },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['layers/*/app/{logic,utils}/**/*.test.ts', 'layers/*/shared/**/*.test.ts']
        }
      },
      // Presentation: components and pages, mounted inside a Nuxt runtime.
      await defineVitestProject({
        test: {
          name: 'component',
          environment: 'nuxt',
          include: ['layers/*/app/{components,pages}/**/*.test.ts']
        }
      })
    ]
  }
})
