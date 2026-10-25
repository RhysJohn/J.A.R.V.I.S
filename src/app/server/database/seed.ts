import 'dotenv/config'
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import { db } from './index'
import { households, users, expenseCategories } from './schema'

// Runs outside the Nuxt/Nitro context, so the auto-imported `hashPassword` helper
// (which reads useRuntimeConfig()) isn't available — this calls the same underlying
// adonisjs/hash scrypt driver directly. The resulting hash is self-describing, so
// nuxt-auth-utils' verifyPassword (used at login) can verify it regardless.
const hash = new Hash(new Scrypt({}))

const DEFAULT_CATEGORIES: { name: string; bucket: 'need' | 'want' | 'saving' }[] = [
  { name: 'Rent/Mortgage', bucket: 'need' },
  { name: 'Groceries', bucket: 'need' },
  { name: 'Utilities', bucket: 'need' },
  { name: 'Council Tax', bucket: 'need' },
  { name: 'Insurance', bucket: 'need' },
  { name: 'Transport', bucket: 'need' },
  { name: 'Dining Out', bucket: 'want' },
  { name: 'Entertainment', bucket: 'want' },
  { name: 'Subscriptions', bucket: 'want' },
  { name: 'Shopping', bucket: 'want' },
  { name: 'Pension AVCs', bucket: 'saving' },
  { name: 'Emergency Fund', bucket: 'saving' },
  { name: 'Investments', bucket: 'saving' }
]

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var ${name} — set it in .env before running the seed script`)
  }
  return value
}

async function main() {
  const existing = await db.select({ id: households.id }).from(households).limit(1)
  if (existing.length > 0) {
    console.log('A household already exists — seed script is a one-off, skipping.')
    return
  }

  const householdName = process.env.HOUSEHOLD_NAME ?? 'Our Household'
  const householdCurrency = process.env.HOUSEHOLD_CURRENCY ?? 'GBP'

  const user1Email = requireEnv('SEED_USER1_EMAIL')
  const user1Password = requireEnv('SEED_USER1_PASSWORD')
  const user1Name = requireEnv('SEED_USER1_NAME')

  const user2Email = requireEnv('SEED_USER2_EMAIL')
  const user2Password = requireEnv('SEED_USER2_PASSWORD')
  const user2Name = requireEnv('SEED_USER2_NAME')

  const [household] = await db
    .insert(households)
    .values({ name: householdName, currency: householdCurrency })
    .returning()

  const [user1PasswordHash, user2PasswordHash] = await Promise.all([
    hash.make(user1Password),
    hash.make(user2Password)
  ])

  const createdUsers = await db
    .insert(users)
    .values([
      { householdId: household.id, email: user1Email, passwordHash: user1PasswordHash, displayName: user1Name },
      { householdId: household.id, email: user2Email, passwordHash: user2PasswordHash, displayName: user2Name }
    ])
    .returning()

  await db.insert(expenseCategories).values(
    DEFAULT_CATEGORIES.map((category) => ({
      householdId: household.id,
      name: category.name,
      bucket: category.bucket
    }))
  )

  console.log(`Seeded household "${household.name}" with users: ${createdUsers.map((u) => u.email).join(', ')}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => process.exit())
