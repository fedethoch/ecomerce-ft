import { BaseException } from "../base/base-exceptions"

export class AccessDataNotProvidedException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("No se proporcionaron datos de acceso", 500, details, userMessage)
  }
}

export class AccessDeniedException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Acceso denegado", 403, details, userMessage)
  }
}