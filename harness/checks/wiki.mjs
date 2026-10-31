// Wiki health: relative links and #anchors resolve, wiki pages have valid frontmatter whose
// sources exist, and every wiki page is listed in docs/wiki/index.md.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { listFiles, repoRelative, repoRoot, toPosix } from '../lib.mjs'

const WIKI = join(repoRoot, 'docs', 'wiki')
const TYPES = ['overview', 'architecture', 'convention', 'domain', 'integration', 'roadmap']
const STATUSES = ['active', 'planned', 'idea', 'deprecated']
const REQUIRED = ['title', 'type', 'status', 'updated', 'sources']

export function slugify(heading) {
  return heading.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s/g, '-')
}

function anchorsOf(file) {
  return new Set(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((line) => /^#{1,6} /.test(line))
      .map((line) => slugify(line.replace(/^#+ /, '')))
  )
}

// Text with fenced code blocks and inline code removed, so example links aren't checked.
export function linkableText(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
}

export function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  return Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^(\w+):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.replace(/\s+#.*$/, '').trim()])
  )
}

export function markdownFiles() {
  return [
    ...listFiles(join(repoRoot, 'docs'), (p) => p.endsWith('.md')),
    ...listFiles(join(repoRoot, '.claude', 'agents'), (p) => p.endsWith('.md')),
    ...['AGENTS.md', 'README.md', 'src/app/README.md'].map((f) => join(repoRoot, f)).filter(existsSync)
  ]
}

export default {
  name: 'wiki',
  description: 'Wiki links, anchors, frontmatter and index coverage',
  run() {
    const problems = []
    const files = markdownFiles()

    for (const file of files) {
      const rel = repoRelative(file)
      const text = readFileSync(file, 'utf8')

      for (const [, link] of linkableText(text).matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^[a-z]+:/i.test(link)) continue
        const [path, anchor] = link.split('#')
        const target = path ? resolve(dirname(file), decodeURIComponent(path)) : file
        if (!existsSync(target)) problems.push(`${rel}: broken link -> ${link}`)
        else if (anchor && target.endsWith('.md') && !anchorsOf(target).has(anchor)) problems.push(`${rel}: missing anchor -> ${link}`)
      }

      if (!file.startsWith(WIKI)) continue
      const fm = parseFrontmatter(text)
      if (!fm) {
        problems.push(`${rel}: no frontmatter`)
        continue
      }
      for (const key of REQUIRED) if (!(key in fm)) problems.push(`${rel}: frontmatter missing "${key}"`)
      if (fm.type && !TYPES.includes(fm.type)) problems.push(`${rel}: invalid type "${fm.type}"`)
      if (fm.status && !STATUSES.includes(fm.status)) problems.push(`${rel}: invalid status "${fm.status}"`)
      const sources = (fm.sources ?? '').replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean)
      for (const source of sources) if (!existsSync(join(repoRoot, source))) problems.push(`${rel}: source not found -> ${source}`)
    }

    const index = readFileSync(join(WIKI, 'index.md'), 'utf8')
    for (const file of files.filter((f) => f.startsWith(WIKI) && !f.endsWith(`${join('wiki', 'index.md')}`))) {
      const rel = toPosix(relative(WIKI, file))
      if (!index.includes(`(${rel})`)) problems.push(`docs/wiki/${rel}: not listed in docs/wiki/index.md`)
    }

    return { ok: problems.length === 0, summary: `${files.length} file(s), ${problems.length} problem(s)`, details: problems }
  }
}
