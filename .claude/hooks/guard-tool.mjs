// PreToolUse guard: stops an agent (or text it was tricked into following) from weakening the
// harness, reading secrets or bypassing git safety. Runs before Edit/Write/Read and shell tools.
// See docs/wiki/architecture/agent-security.md.
//
//   critical   .claude/settings*.json, .claude/hooks/, .github/       -> deny (ask in maintenance mode)
//   controlled harness/, src/app/scripts/, vitest config, AGENTS.md,
//              CLAUDE.md, .claude/agents/, docs/raw/                  -> ask the user
//   secrets    .env files (not .env.example)                          -> deny, read or write
//   shell      writes to critical/controlled paths                     -> deny (use Edit, which asks)
//              --no-verify, force push, hooksPath changes             -> deny
//
// Maintenance mode: start Claude Code with JARVIS_HARNESS_MAINTENANCE=1 to turn "deny" for
// critical paths into "ask". An agent can't set this: hooks read Claude Code's environment, not
// the environment of the commands it runs.
import { relative, resolve } from 'node:path'
import { readHookInput, repoRoot } from './lib.mjs'

const MAINTENANCE = process.env.JARVIS_HARNESS_MAINTENANCE === '1'

const CRITICAL = [/^\.claude\/settings(\.local)?\.json$/, /^\.claude\/hooks\//, /^\.github\//]
const CONTROLLED = [
  /^harness\//,
  /^src\/app\/scripts\//,
  /^src\/app\/vitest\.config\.ts$/,
  /^AGENTS\.md$/,
  /^CLAUDE\.md$/,
  /^\.claude\/agents\//,
  /^docs\/raw\//
]
const SECRET_FILE = /(^|\/)\.env(\.[\w-]+)?$/

// Path fragments as they may appear in a shell command, with either slash direction.
const SHELL_PROTECTED = [
  '.claude/settings',
  '.claude/hooks',
  '.github/',
  'harness/',
  'src/app/scripts',
  'scripts/check-presentation',
  'vitest.config',
  'AGENTS.md',
  'CLAUDE.md',
  '.claude/agents',
  'docs/raw'
]
const SHELL_WRITE = /(^|[^>])>>?(?!&)|\btee\b|\bsed\s+-i|\b(cp|mv|rm|rmdir|touch|truncate|ln|install|chmod)\b|Set-Content|Add-Content|Out-File|Remove-Item|New-Item|Copy-Item|Move-Item|Rename-Item|Clear-Content|\b(del|erase|ren|move|copy)\b|git\s+(checkout|restore|rm|mv|apply|stash)\b|WriteAllText|writeFile|appendFile|unlink|rmSync/i
// .env or .env.<anything> as a path token, except .env.example (committed, no secrets).
const SHELL_SECRET = /(^|[\s"'`/\\=:(])\.env(?!\.example\b)(\.[\w-]+)?(?=$|[\s"'`;|&>)])/
const SHELL_BYPASS = [
  { pattern: /--no-verify\b/, why: 'skips git hooks' },
  { pattern: /\bgit\s+push\b[^\n]*(\s-f\b|--force\b|--force-with-lease\b)/, why: 'force-pushes' },
  { pattern: /core\.hooksPath|disableAllHooks/, why: 'disables hooks' }
]

export function repoPath(filePath) {
  if (!filePath) return null
  const rel = relative(repoRoot, resolve(repoRoot, filePath)).split('\\').join('/')
  return rel.startsWith('..') ? null : rel
}

const matches = (rules, rel) => rules.some((rule) => rule.test(rel))
const isSecret = (rel) => SECRET_FILE.test(rel) && !rel.endsWith('.env.example')

export function decideFile(toolName, rel) {
  if (!rel) return null
  if (isSecret(rel)) return { decision: 'deny', reason: `${rel} holds secrets; agents never read or write .env files` }
  if (toolName === 'Read' || toolName === 'Grep' || toolName === 'Glob') return null
  if (matches(CRITICAL, rel)) {
    return MAINTENANCE
      ? { decision: 'ask', reason: `${rel} controls the harness (maintenance mode): confirm this change` }
      : { decision: 'deny', reason: `${rel} controls the harness and can't be changed by an agent. Edit it yourself, or restart Claude Code with JARVIS_HARNESS_MAINTENANCE=1` }
  }
  if (matches(CONTROLLED, rel)) return { decision: 'ask', reason: `${rel} is a harness or schema file: confirm this change` }
  return null
}

export function decideShell(command) {
  const normalized = command.split('\\').join('/')
  if (SHELL_SECRET.test(normalized)) {
    return { decision: 'deny', reason: 'the command references a .env file; agents never read or write secrets' }
  }
  for (const { pattern, why } of SHELL_BYPASS) {
    if (pattern.test(normalized)) return { decision: 'deny', reason: `the command ${why}, which the harness doesn't allow` }
  }
  const touched = SHELL_PROTECTED.filter((fragment) => normalized.includes(fragment))
  if (touched.length > 0 && SHELL_WRITE.test(normalized)) {
    return MAINTENANCE
      ? { decision: 'ask', reason: `shell command may modify protected harness paths (${touched.join(', ')}) in maintenance mode` }
      : { decision: 'deny', reason: `shell command may modify protected harness paths (${touched.join(', ')}). Use the Edit tool, which asks the user` }
  }
  return null
}

function fileTargets(toolName, input) {
  if (toolName === 'Grep' || toolName === 'Glob') return [input.path, input.glob, input.pattern].filter((v) => typeof v === 'string' && v.includes('.env'))
  return [input.file_path, input.notebook_path, input.path].filter(Boolean)
}

const input = await readHookInput()
const toolName = input.tool_name ?? ''
const toolInput = input.tool_input ?? {}

let verdict = null
if (toolName === 'Bash' || toolName === 'PowerShell') {
  verdict = decideShell(String(toolInput.command ?? ''))
} else {
  for (const target of fileTargets(toolName, toolInput)) {
    verdict = decideFile(toolName, repoPath(target)) ?? (SECRET_FILE.test(String(target)) && !String(target).endsWith('.env.example') ? { decision: 'deny', reason: 'agents never read or write .env files' } : null)
    if (verdict) break
  }
}

if (verdict) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: verdict.decision, permissionDecisionReason: `[harness guard] ${verdict.reason}` }
    })
  )
}
