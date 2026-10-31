// Hook-specific helpers. The shared runners (vitest, paths, formatting) live in harness/lib.mjs so
// the hooks, CI and `npm run harness:check` all validate the same way.
// See docs/wiki/architecture/validation-hooks.md.
import { spawnSync } from 'node:child_process'
import { appRoot } from '../../harness/lib.mjs'

export { appRelative, appRoot, formatFailures, repoRoot, runVitest } from '../../harness/lib.mjs'

export async function readHookInput() {
  let raw = ''
  for await (const chunk of process.stdin) raw += chunk
  // Strip a UTF-8 byte-order mark (PowerShell adds one when piping).
  raw = raw.replace(/^﻿/, '').trim()
  return raw ? JSON.parse(raw) : {}
}

// Which validation a changed file needs:
//   test         a test file itself: run it
//   logic        app/logic, app/utils, shared/: run related unit tests
//   presentation .vue in components/pages/layouts: presentation guard + related component tests
//   glue         app/composables: run related component tests
//   null         nothing to validate per edit (server code, config, docs, …)
export function classify(rel) {
  if (!rel || rel.includes('node_modules/')) return null
  if (/^layers\/[^/]+\/.+\.test\.ts$/.test(rel)) return 'test'
  if (/^layers\/[^/]+\/app\/(logic|utils)\/.+\.ts$/.test(rel)) return 'logic'
  if (/^layers\/[^/]+\/shared\/.+\.ts$/.test(rel) && !rel.endsWith('.d.ts')) return 'logic'
  if (/^layers\/[^/]+\/app\/(components|pages|layouts)\/.+\.vue$/.test(rel)) return 'presentation'
  if (/^layers\/[^/]+\/app\/composables\/.+\.ts$/.test(rel)) return 'glue'
  return null
}

export const PROJECT_FOR = { logic: 'unit', presentation: 'component', glue: 'component' }

export function runPresentationGuard(relFiles) {
  const result = spawnSync(process.execPath, ['scripts/check-presentation.mjs', ...relFiles], { cwd: appRoot, encoding: 'utf8' })
  return { ok: result.status === 0, output: `${result.stdout}${result.stderr}`.trim() }
}

// Emits context that Claude sees after the tool call, without blocking.
export function addContext(hookEventName, text) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName, additionalContext: text } }))
}
