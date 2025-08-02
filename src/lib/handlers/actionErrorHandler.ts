import { AppActionException } from "@/types/exceptions"
import { AppActionError } from "@/types/types"
import { z } from "zod"

// This error schema has to match the error structure returned by the Server Actions (AppActionError)
const errorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  userMessage: z.string().optional(),
  fieldErrors: z.record(z.array(z.string())).optional(),
})

/**
 * Handles errors in server actions by parsing the error response and throwing an AppActionException.
 * @param fn - The function to execute, which returns a Promise.
 * @template T - The type of the result returned by the function.
 *
 * @returns The result of the function if successful.
 * @throws AppActionException - If the function throws an error, it will be caught and rethrown as an AppActionException.
 */

export async function actionErrorHandler<T>(
  fn: () => Promise<T | AppActionError>
): Promise<T> {
  const result = await fn()
  const parsedResult = errorSchema.safeParse(result)

  if (parsedResult.success) {
    const { message, statusCode, userMessage, fieldErrors } = parsedResult.data

    const exception = new AppActionException(
      statusCode,
      message,
      userMessage,
      fieldErrors
    )

    throw exception
  }

  return result as T
}