// Shared helpers for the J.A.R.V.I.S validation hooks. See docs/wiki/architecture/validation-hooks.md.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)))
export const appRoot = join(repoRoot, 'src', 'app')

export async function readHookInput() {
  let raw = ''
  for await (const chunk of process.stdin) raw += chunk
  return raw.trim() ? JSON.parse(raw) : {}
}

// Path relative to src/app with forward slashes, or null when the file is outside the app.
export function appRelative(filePath) {
  if (!filePath) return null
  const rel = relative(appRoot, resolve(filePath)).split('\\').join('/')
  return rel.startsWith('..') || rel.startsWith('/') ? null : rel
}

// Which validation a changed file needs:
//   test         a test file itself: run it
//   logic        app/logic, app/utils, shared/: run related unit tests
//   presentation .vue in components/pages/layouts: presentation guard + related component tests
//   glue         app/composables: run related component tests
//   null         nothing to validate (server code, config, docs, …)
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

// Runs vitest and returns a compact summary parsed from its JSON report.
//   args: e.g. ['related', 'layers/x.ts', '--project', 'unit'] or ['run'] or ['run', 'layers/x.test.ts']
export function runVitest(args) {
  const vitest = join(appRoot, 'node_modules', 'vitest', 'vitest.mjs')
  if (!existsSync(vitest)) {
    return { ran: false, error: 'vitest is not installed: run `npm install` in src/app' }
  }

  const dir = mkdtempSync(join(tmpdir(), 'jarvis-vitest-'))
  const reportFile = join(dir, 'report.json')
  try {
    const result = spawnSync(
      process.execPath,
      [vitest, ...args, '--run', '--passWithNoTests', '--reporter=json', `--outputFile=${reportFile}`],
      { cwd: appRoot, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
    )
    if (!existsSync(reportFile)) {
      return { ran: false, error: `vitest did not produce a report:\n${tail(`${result.stdout}${result.stderr}`, 30)}` }
    }
    return { ran: true, ...summarise(JSON.parse(readFileSync(reportFile, 'utf8'))) }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function summarise(report) {
  const failures = []
  const files = []
  for (const file of report.testResults ?? []) {
    files.push(appRelative(file.name) ?? file.name)
    // A file can fail without any assertion failing (e.g. a syntax or import error).
    if (file.status === 'failed' && !(file.assertionResults ?? []).some((a) => a.status === 'failed')) {
      failures.push({ name: appRelative(file.name) ?? file.name, message: firstLines(file.message, 8) })
    }
    for (const assertion of file.assertionResults ?? []) {
      if (assertion.status === 'failed') {
        failures.push({ name: `${appRelative(file.name) ?? file.name} > ${assertion.fullName}`, message: firstLines(assertion.failureMessages?.join('\n'), 8) })
      }
    }
  }
  return { total: report.numTotalTests ?? 0, passed: report.numPassedTests ?? 0, failed: report.numFailedTests ?? 0, files, failures }
}

export function formatFailures(failures) {
  return failures.map((f) => `- ${f.name}\n${indent(f.message)}`).join('\n')
}

// Keeps the assertion message and the app's own stack frames; drops vitest/node internals.
function firstLines(text = '', count) {
  return String(text)
    .split(/\r?\n/)
    .filter((line) => line.trim() && !/node_modules|node:internal|new Promise|processTicksAndRejections/.test(line))
    .slice(0, count)
    .join('\n')
}

function tail(text, count) {
  return String(text).split(/\r?\n/).slice(-count).join('\n')
}

function indent(text) {
  return text.split('\n').map((line) => `    ${line}`).join('\n')
}

// Emits context that Claude sees after the tool call, without blocking.
export function addContext(hookEventName, text) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName, additionalContext: text } }))
}
