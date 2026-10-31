// Typecheck against a recorded baseline of known errors, so "no new errors" is checked by a
// script rather than remembered. Errors are matched on file + code + message (not line number),
// so unrelated edits that shift lines don't count as new errors.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { appBin, runNode, tail, toPosix } from '../lib.mjs'

const baselineFile = fileURLToPath(new URL('../typecheck-baseline.json', import.meta.url))
const ERROR_LINE = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/

const keyOf = (e) => `${e.file} ${e.code} ${e.message}`
const describe = (e) => `${e.file}${e.line ? `:${e.line}` : ''} ${e.code} ${e.message}`

export function parseTypecheckOutput(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim().match(ERROR_LINE))
    .filter(Boolean)
    .map(([, file, line, , code, message]) => ({ file: toPosix(file), line: Number(line), code, message: message.trim() }))
}

// Multiset difference: errors in `a` not accounted for by `b`.
export function subtractErrors(a, b) {
  const remaining = new Map()
  for (const e of b) remaining.set(keyOf(e), (remaining.get(keyOf(e)) ?? 0) + 1)
  return a.filter((e) => {
    const count = remaining.get(keyOf(e)) ?? 0
    if (count === 0) return true
    remaining.set(keyOf(e), count - 1)
    return false
  })
}

export default {
  name: 'typecheck',
  description: 'vue-tsc typecheck with no errors beyond harness/typecheck-baseline.json',
  run({ updateBaseline }) {
    const nuxt = appBin('nuxt/bin/nuxt.mjs')
    if (!nuxt) return { ok: false, summary: 'nuxt is not installed: run `npm install` in src/app', details: [] }

    const result = runNode(nuxt, ['typecheck'])
    const errors = parseTypecheckOutput(result.output)
    if (result.status !== 0 && errors.length === 0) {
      return { ok: false, summary: 'typecheck failed without reporting TS errors', details: tail(result.output, 30).split('\n') }
    }

    if (updateBaseline) {
      const entries = errors.map(({ file, code, message }) => ({ file, code, message }))
      writeFileSync(baselineFile, `${JSON.stringify({ note: 'Known typecheck errors. Shrink this list; never grow it to hide a new error.', errors: entries }, null, 2)}\n`)
      return { ok: true, summary: `baseline updated with ${entries.length} known error(s)`, details: [] }
    }

    const baseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')).errors : []
    const added = subtractErrors(errors, baseline)
    const fixed = subtractErrors(baseline, errors)
    const notes = fixed.length > 0 ? [`${fixed.length} baseline error(s) are fixed: run with --update-baseline to lock that in`] : []

    if (added.length > 0) {
      return { ok: false, summary: `${added.length} new error(s) (baseline ${baseline.length})`, details: [...added.map(describe), ...notes] }
    }
    return { ok: true, summary: `no new errors (${errors.length} known, baseline ${baseline.length})`, details: notes }
  }
}
