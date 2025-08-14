import { BaseException } from "../base/base-exceptions"

export class PaymentException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al procesar el pago", 500, details, userMessage)
  }
}

export class PaymentNotFoundException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Pago no encontrado", 404, details, userMessage)
  }
}

export class PaymentPreferenceDataNotFoundException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super(
      "Datos de preferencia de pago no encontrados",
      404,
      details,
      userMessage
    )
  }
}

export class PaymentDeniedByCourseAlreadyAcquiredException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("El curso ya fue adquirido", 400, details, userMessage)
  }
}