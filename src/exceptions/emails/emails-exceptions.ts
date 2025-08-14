import { BaseException } from "../base/base-exceptions"

export class EmailSendingException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al enviar el email", 500, details, userMessage)
  }
}