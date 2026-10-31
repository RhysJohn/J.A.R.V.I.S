import { formatFailures, runVitest } from '../lib.mjs'

export default {
  name: 'tests',
  description: 'Unit and component tests (vitest, both projects)',
  run() {
    const result = runVitest(['run'])
    if (!result.ran) return { ok: false, summary: 'could not run vitest', details: [result.error] }
    if (result.failures.length > 0) {
      return {
        ok: false,
        summary: `${result.failures.length} failure(s), ${result.passed}/${result.total} passed`,
        details: formatFailures(result.failures).split('\n')
      }
    }
    return { ok: true, summary: `${result.passed}/${result.total} passed in ${result.files.length} file(s)`, details: [] }
  }
}
