import { join } from 'node:path'
import { appRoot, runNode } from '../lib.mjs'

export default {
  name: 'presentation',
  description: 'No business logic or data access in .vue files',
  run() {
    const result = runNode(join(appRoot, 'scripts', 'check-presentation.mjs'), [])
    const lines = result.output.trim().split(/\r?\n/)
    return { ok: result.status === 0, summary: lines[0] ?? '', details: lines.slice(1) }
  }
}
