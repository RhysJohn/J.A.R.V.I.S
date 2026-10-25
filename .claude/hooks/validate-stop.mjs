// Stop / SubagentStop hook: before an agent finishes, re-validate everything it left uncommitted
// in src/app (presentation guard over changed .vue files, then the full unit + component suite).
// Blocks the stop once with the failures so the agent fixes them; never blocks twice in a row.
import { spawnSync } from 'node:child_process'
import { appRelative, classify, formatFailures, readHookInput, repoRoot, runPresentationGuard, runVitest } from './lib.mjs'
import { join } from 'node:path'

const input = await readHookInput()
if (input.stop_hook_active) process.exit(0)

const status = spawnSync('git', ['status', '--porcelain', '--untracked-files=all', '--', 'src/app'], { cwd: repoRoot, encoding: 'utf8' })
const changed = status.stdout
  .split(/\r?\n/)
  .filter((line) => line.trim() && !line.startsWith(' D') && !line.startsWith('D '))
  .map((line) => appRelative(join(repoRoot, line.slice(3).replace(/^.* -> /, '').replace(/^"|"$/g, ''))))
  .filter((rel) => classify(rel))

if (changed.length === 0) process.exit(0)

const problems = []

const vueFiles = changed.filter((rel) => rel.endsWith('.vue'))
if (vueFiles.length > 0) {
  const guard = runPresentationGuard(vueFiles)
  if (!guard.ok) problems.push(guard.output)
}

const result = runVitest(['run'])
if (!result.ran) problems.push(`Could not run tests: ${result.error}`)
else if (result.failures.length > 0) problems.push(`${result.failures.length} test failure(s):\n${formatFailures(result.failures)}`)

if (problems.length > 0) {
  const reason = `[harness] Validation failed for uncommitted changes in src/app. Fix these before finishing:\n${problems.join('\n\n')}`
  process.stdout.write(JSON.stringify({ decision: 'block', reason }))
}
