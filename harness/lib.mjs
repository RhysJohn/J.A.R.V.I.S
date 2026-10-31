// Shared helpers for the harness checks and the Claude Code hooks. Plain Node, no dependencies,
// so it runs before `npm install` finishes and identically on Windows, macOS, Linux and CI.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
export const appRoot = join(repoRoot, 'src', 'app')

export function toPosix(path) {
  return path.split('\\').join('/')
}

// Path relative to src/app with forward slashes, or null when the file is outside the app.
export function appRelative(filePath) {
  if (!filePath) return null
  const rel = toPosix(relative(appRoot, resolve(appRoot, filePath)))
  return rel.startsWith('..') || rel.startsWith('/') ? null : rel
}

export function repoRelative(filePath) {
  return toPosix(relative(repoRoot, resolve(repoRoot, filePath)))
}

// Runs a Node script (a package's bin file) without a shell, so behaviour doesn't depend on
// bash, cmd or PowerShell. Returns { status, output }.
export function runNode(script, args, { cwd = appRoot, env } = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, ...env }
  })
  return { status: result.status ?? 1, output: `${result.stdout ?? ''}${result.stderr ?? ''}`, error: result.error }
}

export function appBin(relPath) {
  const path = join(appRoot, 'node_modules', relPath)
  return existsSync(path) ? path : null
}

export function listFiles(dir, predicate, { skip = ['node_modules', '.git', '.nuxt', '.output'] } = {}) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return skip.includes(entry.name) ? [] : listFiles(path, predicate, { skip })
    return predicate(path) ? [path] : []
  })
}

export function tail(text, count) {
  return String(text).split(/\r?\n/).filter((line) => line.trim()).slice(-count).join('\n')
}

// ---- Vitest -------------------------------------------------------------------------------

// Runs vitest and returns a compact summary parsed from its JSON report.
//   args: e.g. ['related', 'layers/x.ts', '--project', 'unit'] or ['run'] or ['run', 'layers/x.test.ts']
export function runVitest(args) {
  const vitest = appBin('vitest/vitest.mjs')
  if (!vitest) return { ran: false, error: 'vitest is not installed: run `npm install` in src/app' }

  const dir = mkdtempSync(join(tmpdir(), 'jarvis-vitest-'))
  const reportFile = join(dir, 'report.json')
  try {
    const result = runNode(vitest, [...args, '--run', '--passWithNoTests', '--reporter=json', `--outputFile=${reportFile}`])
    if (!existsSync(reportFile)) {
      return { ran: false, error: `vitest did not produce a report:\n${tail(result.output, 30)}` }
    }
    return { ran: true, ...summariseVitest(JSON.parse(readFileSync(reportFile, 'utf8'))) }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function summariseVitest(report) {
  const failures = []
  const files = []
  for (const file of report.testResults ?? []) {
    const name = appRelative(file.name) ?? file.name
    files.push(name)
    // A file can fail without any assertion failing (e.g. a syntax or import error).
    if (file.status === 'failed' && !(file.assertionResults ?? []).some((a) => a.status === 'failed')) {
      failures.push({ name, message: firstLines(file.message, 8) })
    }
    for (const assertion of file.assertionResults ?? []) {
      if (assertion.status === 'failed') {
        failures.push({ name: `${name} > ${assertion.fullName}`, message: firstLines(assertion.failureMessages?.join('\n'), 8) })
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

function indent(text) {
  return text.split('\n').map((line) => `    ${line}`).join('\n')
}
