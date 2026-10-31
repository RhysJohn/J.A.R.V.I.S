// Harness integrity: catches an agent (or injected content) quietly weakening the controls.
//   - raw sources are immutable: no tracked file under docs/raw/ modified or deleted
//   - no test file deleted
//   - harness/typecheck-baseline.json never grows
//   - no injection-style instructions in the wiki or ADRs (the trusted knowledge layer)
//
// Compares against HARNESS_BASE_REF when set (CI: the PR base or the pre-push commit), otherwise
// against HEAD, i.e. the uncommitted changes an agent is about to finish with.
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { listFiles, repoRelative, repoRoot } from '../lib.mjs'
import { linkableText } from './wiki.mjs'

// Phrases that read as instructions to an agent rather than documentation. Text inside code
// blocks/inline code is ignored, so documenting a pattern (like here) is fine.
export const INJECTION_PATTERNS = [
  { pattern: /\b(ignore|disregard|forget)\b[^.\n]{0,40}\b(previous|prior|above|earlier|all)\b[^.\n]{0,20}\binstructions?\b/i, why: 'tries to override earlier instructions' },
  { pattern: /\b(you|agents?|claude|the assistant)\s+(must|should|are required to)\s+(now\s+)?(run|execute|install|download|curl|delete|remove|push|disable|send|email|post)\b/i, why: 'directs an agent to take an action' },
  { pattern: /\b(curl|wget|iwr|Invoke-WebRequest)\b[^\n]*\|\s*(ba|z)?sh\b|\biex\s*\(|\bInvoke-Expression\b/i, why: 'download-and-execute command' },
  { pattern: /\bsystem prompt\b|\bnew instructions?\s*:/i, why: 'prompt-injection phrasing' },
  { pattern: /[A-Za-z0-9+/]{160,}={0,2}/, why: 'long encoded blob (possible hidden payload)' }
]

function git(args) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' })
  return { ok: result.status === 0, out: (result.stdout ?? '').trim(), err: (result.stderr ?? '').trim() }
}

function resolveBase() {
  const ref = process.env.HARNESS_BASE_REF
  // GitHub sends an all-zero "before" SHA for the first push of a branch: nothing to diff against.
  if (!ref || /^0+$/.test(ref)) return { base: 'HEAD', label: 'uncommitted changes' }
  const mergeBase = git(['merge-base', 'HEAD', ref])
  if (mergeBase.ok) return { base: mergeBase.out, label: `changes since ${ref}` }
  if (git(['rev-parse', '--verify', `${ref}^{commit}`]).ok) return { base: ref, label: `changes since ${ref}` }
  throw new Error(`HARNESS_BASE_REF "${ref}" isn't reachable; fetch full history (fetch-depth: 0)`)
}

// [{ status: 'M'|'D'|'A'|'R…', path }] for tracked changes between base and the working tree.
function changedFiles(base) {
  const diff = git(['diff', '--name-status', base, '--'])
  if (!diff.ok) throw new Error(`git diff failed: ${diff.err}`)
  return diff.out
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [status, ...paths] = line.split('\t')
      // Renames report "R100\told\tnew": the old path is what was removed.
      return { status: status[0], path: paths[0] }
    })
}

function baselineCount(content) {
  try {
    return JSON.parse(content).errors.length
  } catch {
    return null
  }
}

export function findInjection(markdown) {
  const hits = []
  linkableText(markdown)
    .split(/\r?\n/)
    .forEach((line, index) => {
      for (const { pattern, why } of INJECTION_PATTERNS) {
        if (pattern.test(line)) hits.push({ line: index + 1, why, text: line.trim().slice(0, 120) })
      }
    })
  return hits
}

export default {
  name: 'integrity',
  description: 'Raw sources unmodified, no tests deleted, typecheck baseline not grown, no injection text in wiki/ADRs',
  run() {
    const problems = []
    const { base, label } = resolveBase()
    const changes = changedFiles(base)

    for (const { status, path } of changes) {
      // docs/raw/README.md is the index of sources, not a source, so it may be updated.
      if (path.startsWith('docs/raw/') && path !== 'docs/raw/README.md' && (status === 'M' || status === 'D' || status === 'R')) {
        problems.push(`${path}: raw sources are immutable (${status === 'M' ? 'modified' : 'removed'}); add a new file instead`)
      }
      if (/\.test\.(ts|mjs|js)$/.test(path) && (status === 'D' || status === 'R')) {
        problems.push(`${path}: test file deleted; deleting tests needs explicit human approval`)
      }
    }

    const baselinePath = 'harness/typecheck-baseline.json'
    const before = git(['show', `${base}:${baselinePath}`])
    if (before.ok) {
      const was = baselineCount(before.out)
      const now = baselineCount(readFileSync(join(repoRoot, baselinePath), 'utf8'))
      if (was !== null && now !== null && now > was) {
        problems.push(`${baselinePath}: grew from ${was} to ${now} known error(s); the baseline may only shrink`)
      }
    }

    const knowledge = [
      ...listFiles(join(repoRoot, 'docs', 'wiki'), (p) => p.endsWith('.md')),
      ...listFiles(join(repoRoot, 'docs', 'decisions'), (p) => p.endsWith('.md'))
    ]
    for (const file of knowledge) {
      for (const hit of findInjection(readFileSync(file, 'utf8'))) {
        problems.push(`${repoRelative(file)}:${hit.line}: ${hit.why}: "${hit.text}"`)
      }
    }

    return {
      ok: problems.length === 0,
      summary: `${changes.length} changed file(s) (${label}), ${knowledge.length} knowledge page(s) scanned, ${problems.length} problem(s)`,
      details: problems
    }
  }
}
