export class AppActionException extends Error {
  public readonly statusCode: number
  public readonly userMessage?: string
  public readonly fieldErrors?: Record<string, string[]>

  constructor(
    statusCode: number,
    message: string,
    userMessage?: string,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "AppActionException"
    this.statusCode = statusCode
    this.userMessage = userMessage
    this.fieldErrors = fieldErrors
  }
}