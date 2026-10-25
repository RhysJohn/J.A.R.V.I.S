import { z } from 'zod'

export const expenseBucketSchema = z.enum(['need', 'want', 'saving'])
export type ExpenseBucket = z.infer<typeof expenseBucketSchema>

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  bucket: expenseBucketSchema
})
export type CreateCategoryInput = z.infer<typeof createCategorySchema>

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  bucket: expenseBucketSchema.optional(),
  isArchived: z.boolean().optional()
})
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

// First-of-month date, matching the `date` column budget_entries.month is stored as.
export const monthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-01$/, 'Month must be the first of the month (YYYY-MM-01)')

export const createBudgetEntrySchema = z.object({
  categoryId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  month: monthSchema,
  amount: z.number().nonnegative(),
  notes: z.string().trim().max(500).nullable().optional()
})
export type CreateBudgetEntryInput = z.infer<typeof createBudgetEntrySchema>

export const updateBudgetEntrySchema = z.object({
  amount: z.number().nonnegative().optional(),
  notes: z.string().trim().max(500).nullable().optional()
})
export type UpdateBudgetEntryInput = z.infer<typeof updateBudgetEntrySchema>
