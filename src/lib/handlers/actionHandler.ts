import { getHttpStatusCode } from "@/lib/httpErrorMapper/httpErrorMapper"
import { AppActionError } from "@/types/types"
import { BaseException } from "@/exceptions/base/base-exceptions"
import { ValidationException } from "@/exceptions/base/base-exceptions"

/**
 * Executes a function and handles errors by throwing an AppActionError.
 * @param fn - The function to execute, which returns a Promise.
 * @returns The result of the function if successful.
 * @throws AppActionException - If the function throws an error, it will be caught and rethrown as an AppActionError.
 */

export async function actionHandler<T>(
  fn: () => Promise<T>
): Promise<T | AppActionError> {
  try {
    return await fn()
  } catch (error) {
    const statusCode = getHttpStatusCode(error)
    const message = error instanceof Error ? error.message : "Unknown error"
    const userMessage =
      error instanceof BaseException ? error.userMessage : undefined

    // Handle ValidationException specifically to include field errors
    if (error instanceof ValidationException) {
      return {
        statusCode,
        message: message,
        userMessage,
        fieldErrors: error.fieldErrors,
      } as AppActionError
    }

    return {
      statusCode,
      message: message,
      userMessage,
    } as AppActionError
  }
}