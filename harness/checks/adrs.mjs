// ADR consistency: numbering, title, status, superseded links, and both indexes
// (docs/decisions/README.md and docs/wiki/index.md) list every ADR.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { repoRoot } from '../lib.mjs'

const DECISIONS = join(repoRoot, 'docs', 'decisions')
const STATUS = /^- \*\*Status:\*\* (proposed|accepted|rejected|superseded by \[(\d{4})\]\((\d{4}-[^)]+\.md)\))/m

export default {
  name: 'adrs',
  description: 'ADR numbering, status and index coverage',
  run() {
    const problems = []
    const adrs = readdirSync(DECISIONS).filter((name) => /^\d{4}-.+\.md$/.test(name)).sort()
    const readme = readFileSync(join(DECISIONS, 'README.md'), 'utf8')
    const wikiIndex = readFileSync(join(repoRoot, 'docs', 'wiki', 'index.md'), 'utf8')

    adrs.forEach((name, i) => {
      const number = name.slice(0, 4)
      const expected = String(i + 1).padStart(4, '0')
      if (number !== expected) problems.push(`${name}: expected number ${expected} (numbers must be unique and sequential)`)

      const text = readFileSync(join(DECISIONS, name), 'utf8')
      if (!new RegExp(`^# ${number} — `, 'm').test(text)) problems.push(`${name}: title must start "# ${number} — "`)

      const status = text.match(STATUS)
      if (!status) problems.push(`${name}: missing or invalid "- **Status:**" line (proposed | accepted | rejected | superseded by [NNNN](…))`)
      else if (status[3] && !existsSync(join(DECISIONS, status[3]))) problems.push(`${name}: superseded by a missing ADR ${status[3]}`)

      if (!readme.includes(`](${name})`)) problems.push(`${name}: not in the docs/decisions/README.md index`)
      if (!wikiIndex.includes(`decisions/${name})`)) problems.push(`${name}: not in the docs/wiki/index.md decisions list`)
    })

    return { ok: problems.length === 0, summary: `${adrs.length} ADR(s), ${problems.length} problem(s)`, details: problems }
  }
}
