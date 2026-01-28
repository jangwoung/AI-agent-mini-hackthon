import { z } from 'zod'
import { ValidationError } from './errors'

/**
 * Validate data against a Zod schema and throw ValidationError if invalid
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fieldName?: string
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => e.message).join(', ')
      throw new ValidationError(message, fieldName)
    }
    throw error
  }
}

/**
 * Safe validation that returns result instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}
