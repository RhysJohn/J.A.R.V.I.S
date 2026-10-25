// PostToolUse hook (Write|Edit): validates the file that was just changed.
//   logic/utils/shared .ts  -> unit tests related to the file
//   components/pages/layouts .vue -> presentation guard, then component tests related to the file
//   composables .ts -> component tests related to the file
//   *.test.ts -> that test file
// Exit 2 (stderr shown to Claude) when anything fails; otherwise a one-line context note.
import { PROJECT_FOR, addContext, appRelative, classify, formatFailures, readHookInput, runPresentationGuard, runVitest } from './lib.mjs'

const EVENT = 'PostToolUse'
const input = await readHookInput()
const rel = appRelative(input.tool_input?.file_path ?? input.tool_response?.filePath)
const kind = classify(rel)
if (!kind) process.exit(0)

if (kind === 'presentation') {
  const guard = runPresentationGuard([rel])
  if (!guard.ok) {
    process.stderr.write(`[harness] ${rel} breaks the presentation rule (no business logic in .vue files):\n${guard.output}\n`)
    process.exit(2)
  }
}

const project = PROJECT_FOR[kind]
const result = kind === 'test' ? runVitest(['run', rel]) : runVitest(['related', rel, '--project', project])
const label = kind === 'test' ? 'tests in' : `${project} tests related to`

if (!result.ran) {
  process.stderr.write(`[harness] Could not run ${label} ${rel}: ${result.error}\n`)
  process.exit(2)
}

if (result.failed > 0 || result.failures.length > 0) {
  process.stderr.write(`[harness] ${result.failures.length} failure(s) in ${label} ${rel}:\n${formatFailures(result.failures)}\n`)
  process.exit(2)
}

if (result.total === 0) {
  const testFile = rel.replace(/\.(vue|ts)$/, '.test.ts')
  addContext(EVENT, `[harness] No ${project} tests cover ${rel}. Add ${testFile} (see docs/wiki/conventions/frontend-architecture.md).`)
  process.exit(0)
}

addContext(EVENT, `[harness] ${result.passed}/${result.total} ${label} ${rel} passed (${result.files.length} file(s)).`)
