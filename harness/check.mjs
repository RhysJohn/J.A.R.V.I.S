#!/usr/bin/env node
// The one command every gate runs: Claude Code hooks, CI and humans.
//
//   node harness/check.mjs [--profile fast|full] [--only a,b] [--skip a,b] [--json] [--report file]
//                          [--update-baseline]
//
//   fast  integrity, wiki, adrs, presentation, schema, tests   (Stop hooks; ~25s)
//   full  fast + typecheck + build                             (CI and before merging; default)
//
// Exit code 0 when every selected check passes, 1 otherwise. See docs/wiki/architecture/quality-gates.md.
import { writeFileSync } from 'node:fs'
import adrs from './checks/adrs.mjs'
import build from './checks/build.mjs'
import integrity from './checks/integrity.mjs'
import presentation from './checks/presentation.mjs'
import schema from './checks/schema.mjs'
import tests from './checks/tests.mjs'
import typecheck from './checks/typecheck.mjs'
import wiki from './checks/wiki.mjs'

// Cheapest first, so the quick signals arrive before the slow ones.
const CHECKS = [integrity, wiki, adrs, presentation, schema, tests, typecheck, build]
const PROFILES = {
  fast: ['integrity', 'wiki', 'adrs', 'presentation', 'schema', 'tests'],
  full: CHECKS.map((check) => check.name)
}

function parseArgs(argv) {
  const opts = { profile: 'full', only: null, skip: [], json: false, report: null, updateBaseline: false }
  const list = (value) => value.split(',').map((s) => s.trim()).filter(Boolean)
  for (let i = 0; i < argv.length; i++) {
    const [flag, inline] = argv[i].split('=')
    const value = () => inline ?? argv[++i]
    if (flag === '--profile') opts.profile = value()
    else if (flag === '--only') opts.only = list(value())
    else if (flag === '--skip') opts.skip = list(value())
    else if (flag === '--json') opts.json = true
    else if (flag === '--report') opts.report = value()
    else if (flag === '--update-baseline') opts.updateBaseline = true
    else if (flag === '--help' || flag === '-h') opts.help = true
    else throw new Error(`Unknown option ${argv[i]}`)
  }
  return opts
}

const opts = parseArgs(process.argv.slice(2))
if (opts.help) {
  console.log(`Checks: ${CHECKS.map((c) => `\n  ${c.name.padEnd(13)}${c.description}`).join('')}\nProfiles: fast = ${PROFILES.fast.join(', ')}; full = all`)
  process.exit(0)
}
if (opts.updateBaseline) opts.only = ['typecheck']
if (!opts.only && !PROFILES[opts.profile]) throw new Error(`Unknown profile ${opts.profile} (use fast or full)`)

const unknown = [...(opts.only ?? []), ...opts.skip].filter((name) => !CHECKS.some((c) => c.name === name))
if (unknown.length) throw new Error(`Unknown check(s): ${unknown.join(', ')}`)

const selected = CHECKS.filter((check) => (opts.only ?? PROFILES[opts.profile]).includes(check.name) && !opts.skip.includes(check.name))

const results = []
for (const check of selected) {
  if (!opts.json && process.stdout.isTTY) process.stdout.write(`… ${check.name}\r`)
  const started = Date.now()
  let result
  try {
    result = check.run({ updateBaseline: opts.updateBaseline })
  } catch (error) {
    result = { ok: false, summary: `crashed: ${error.message}`, details: String(error.stack ?? '').split('\n').slice(1, 6) }
  }
  const entry = { name: check.name, ok: result.ok, summary: result.summary, details: result.details ?? [], durationMs: Date.now() - started }
  results.push(entry)
  if (!opts.json) {
    console.log(`${entry.ok ? '✓' : '✗'} ${entry.name.padEnd(13)}${entry.summary}  (${(entry.durationMs / 1000).toFixed(1)}s)`)
    for (const line of entry.details) console.log(`    ${line}`)
  }
}

const report = { ok: results.every((r) => r.ok), profile: opts.only ? 'custom' : opts.profile, checks: results }
if (opts.report) writeFileSync(opts.report, `${JSON.stringify(report, null, 2)}\n`)
if (opts.json) console.log(JSON.stringify(report, null, 2))
else console.log(report.ok ? `\nharness: all ${results.length} check(s) passed` : `\nharness: ${results.filter((r) => !r.ok).map((r) => r.name).join(', ')} failed`)

process.exit(report.ok ? 0 : 1)
