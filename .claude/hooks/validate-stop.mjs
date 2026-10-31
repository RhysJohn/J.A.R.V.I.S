// Stop / SubagentStop hook: before an agent finishes with uncommitted changes, run the harness's
// `fast` profile (wiki, ADRs, presentation guard, schema drift, unit + component tests) — the same
// checks CI runs, minus typecheck and build. Blocks the stop once with the failures so the agent
// fixes them; never blocks twice in a row (stop_hook_active).
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { readHookInput, repoRoot } from './lib.mjs'

const input = await readHookInput()
if (input.stop_hook_active) process.exit(0)

const status = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: repoRoot, encoding: 'utf8' })
if (status.status !== 0 || !status.stdout.trim()) process.exit(0)

const run = spawnSync(process.execPath, [join(repoRoot, 'harness', 'check.mjs'), '--profile', 'fast', '--json'], {
  cwd: repoRoot,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024
})

let report
try {
  report = JSON.parse(run.stdout)
} catch {
  const reason = `[harness] The harness check could not run. Fix this before finishing:\n${`${run.stdout}${run.stderr}`.trim().split(/\r?\n/).slice(-20).join('\n')}`
  process.stdout.write(JSON.stringify({ decision: 'block', reason }))
  process.exit(0)
}

if (!report.ok) {
  const failed = report.checks
    .filter((check) => !check.ok)
    .map((check) => [`✗ ${check.name}: ${check.summary}`, ...check.details.slice(0, 40).map((line) => `    ${line}`)].join('\n'))
  const reason = `[harness] Checks failed for uncommitted changes (npm run harness:check -- --profile fast). Fix these before finishing:\n${failed.join('\n\n')}`
  process.stdout.write(JSON.stringify({ decision: 'block', reason }))
}
