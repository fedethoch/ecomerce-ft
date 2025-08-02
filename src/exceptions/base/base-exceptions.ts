export class BaseException extends Error {
  public readonly statusCode: number
  public readonly name: string
  public readonly details?: unknown
  public readonly userMessage?: string

  constructor(
    message: string,
    statusCode: number = 500,
    details?: unknown,
    userMessage?: string
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.details = details
    this.userMessage = userMessage
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestException extends BaseException {
  constructor(message = "Bad Request", details?: unknown) {
    super(
      message,
      400,
      details,
      "Error del servidor, por favor intente más tarde."
    )
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message = "Unauthorized", details?: unknown) {
    super(
      message,
      401,
      details,
      "Acceso no autorizado, por favor inicie sesión."
    )
  }
}

export class ForbiddenException extends BaseException {
  constructor(message = "Forbidden", details?: unknown) {
    super(message, 403, details, "Acceso restricto, no tiene permisos.")
  }
}

export class NotFoundException extends BaseException {
  constructor(message = "Resource not found", details?: unknown) {
    super(message, 404, details, "Recurso no encontrado, por favor verifique.")
  }
}

export class ConflictException extends BaseException {
  constructor(message = "Conflict in the request", details?: unknown) {
    super(message, 409, details, "Conflicto en la solicitud, por favor revise.")
  }
}

export class InternalServerException extends BaseException {
  constructor(message = "Internal server error", details?: unknown) {
    super(
      message,
      500,
      details,
      "Error interno del servidor, por favor intente más tarde."
    )
  }
}

export class DatabaseException extends BaseException {
  constructor(message = "Database error", details?: unknown) {
    super(
      message,
      500,
      details,
      "Error en la base de datos, por favor intente más tarde."
    )
  }
}

export class InvalidInputException extends BaseException {
  constructor(message = "Invalid input", details?: unknown) {
    super(message, 400, details, "Entrada inválida, por favor revise.")
  }
}

export class ValidationException extends BaseException {
  public readonly fieldErrors: Record<string, string[]>

  constructor(
    message = "Validation failed",
    fieldErrors: Record<string, string[]> = {},
    details?: unknown
  ) {
    super(message, 400, details, "Error de validación en los campos.")
    this.fieldErrors = fieldErrors
  }
}