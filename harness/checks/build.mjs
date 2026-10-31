import { appBin, runNode, tail } from '../lib.mjs'

export default {
  name: 'build',
  description: 'Production build (nuxt build)',
  run() {
    const nuxt = appBin('nuxt/bin/nuxt.mjs')
    if (!nuxt) return { ok: false, summary: 'nuxt is not installed: run `npm install` in src/app', details: [] }
    const result = runNode(nuxt, ['build'])
    if (result.status !== 0) return { ok: false, summary: 'build failed', details: tail(result.output, 40).split('\n') }
    return { ok: true, summary: 'build succeeded', details: [] }
  }
}
