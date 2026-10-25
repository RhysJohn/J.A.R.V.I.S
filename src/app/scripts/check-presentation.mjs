// Presentation guard: .vue files (components, pages, layouts) must stay presentation-only.
// Calculations belong in app/logic (unit tested); data access belongs in app/composables.
//
// Usage: node scripts/check-presentation.mjs [file.vue ...]   (no args = every .vue in layers/)
// Exit code 1 with one line per violation when any rule is broken.
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = fileURLToPath(new URL('..', import.meta.url))

const RULES = [
  { pattern: /\$fetch\(|\buseFetch\(|\buseAsyncData\(/, why: 'data access belongs in a composable (app/composables)' },
  { pattern: /\.reduce\(|\.filter\(|\.sort\(|\bMath\./, why: 'calculations belong in app/logic, where they are unit tested' }
]

// A line ending in this comment is exempt, for the rare case that genuinely needs it.
const ALLOW_COMMENT = 'presentation-guard-ignore'

function listVueFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : listVueFiles(path)
    return entry.name.endsWith('.vue') ? [path] : []
  })
}

export function checkFile(file) {
  const violations = []
  readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, index) => {
    if (line.includes(ALLOW_COMMENT)) return
    for (const rule of RULES) {
      if (rule.pattern.test(line)) {
        violations.push(`${relative(appRoot, file)}:${index + 1}: ${line.trim()}  ->  ${rule.why}`)
      }
    }
  })
  return violations
}

const files = process.argv.length > 2 ? process.argv.slice(2) : listVueFiles(join(appRoot, 'layers'))
const violations = files.filter((file) => file.endsWith('.vue')).flatMap(checkFile)

if (violations.length > 0) {
  console.error(`Presentation guard: ${violations.length} violation(s)\n${violations.join('\n')}`)
  process.exit(1)
}
console.log(`Presentation guard: ${files.length} file(s) clean`)
