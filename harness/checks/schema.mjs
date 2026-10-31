// Schema drift: the Drizzle schema must match the committed migrations. Runs `drizzle-kit
// generate` against a temporary copy of the migrations, so it never writes into the repo, and
// fails if drizzle-kit would create a new migration. Needs no database.
import { cpSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { appBin, appRoot, runNode, tail, toPosix } from '../lib.mjs'

// drizzle-kit joins the working directory onto `out` even when it's absolute (on Windows that
// produces "src\app\C:\…"), so the scratch copy lives inside src/app (gitignored node_modules
// cache) and every path handed to drizzle-kit is relative to src/app.
const scratchRoot = join(appRoot, 'node_modules', '.cache', 'harness')

export default {
  name: 'schema',
  description: 'Drizzle schema matches the committed migrations',
  run() {
    const drizzleKit = appBin('drizzle-kit/bin.cjs')
    if (!drizzleKit) return { ok: false, summary: 'drizzle-kit is not installed: run `npm install` in src/app', details: [] }

    mkdirSync(scratchRoot, { recursive: true })
    const dir = mkdtempSync(join(scratchRoot, 'schema-'))
    try {
      const migrations = join(dir, 'migrations')
      cpSync(join(appRoot, 'server', 'database', 'migrations'), migrations, { recursive: true })
      const before = new Set(readdirSync(migrations))

      const config = join(dir, 'drizzle.config.mjs')
      writeFileSync(
        config,
        `export default ${JSON.stringify({
          schema: './server/database/schema.ts',
          out: `./${toPosix(relative(appRoot, migrations))}`,
          dialect: 'postgresql',
          dbCredentials: { url: 'postgres://harness:harness@localhost:5432/harness' }
        })}\n`
      )

      const result = runNode(drizzleKit, ['generate', `--config=${config}`])
      const created = readdirSync(migrations).filter((name) => !before.has(name))

      if (result.status !== 0) return { ok: false, summary: 'drizzle-kit generate failed', details: tail(result.output, 20).split('\n') }
      if (created.length > 0 || !/No schema changes/i.test(result.output)) {
        return {
          ok: false,
          summary: 'schema has changes with no migration: run `npm run db:generate` and commit the migration',
          details: [...created.map((name) => `would create: ${name}`), ...tail(result.output, 15).split('\n')]
        }
      }
      return { ok: true, summary: 'no drift', details: [] }
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  }
}
