import { BaseException } from "@/exceptions/base/base-exceptions"

export class AuthCreationException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al crear el usuario", 500, details, userMessage)
  }
}

export class AuthLoginException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al iniciar sesión", 500, details, userMessage)
  }
}

export class AuthMissingUserIdException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("No se pudo obtener el ID del usuario", 500, details, userMessage)
  }
}

export class AuthUserSessionMissingException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("No se pudo obtener la sesion del usuario", 500, details, userMessage)
  }
}

export class AuthMissingUserException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("No se pudo obtener el usuario", 500, details, userMessage)
  }
}

export class AuthLogoutException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al cerrar sesión", 500, details, userMessage)
  }
}

export class AuthVerificationException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al verificar el usuario", 500, details, userMessage)
  }
}

export class AuthRecoverPasswordException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al recuperar la contraseña", 500, details, userMessage)
  }
}

export class AuthResetPasswordException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al restablecer la contraseña", 500, details, userMessage)
  }
}