import { BaseException } from "../base/base-exceptions"

export class ProductCreationException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al crear el producto", 500, details, userMessage)
  }
}

export class ProductValidationException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al validar el producto", 500, details, userMessage)
  }
}

export class ProductNotFoundException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("producto no encontrado", 404, details, userMessage)
  }
}

export class ProductUpdateException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al actualizar el producto", 500, details, userMessage)
  }
}

export class ProductShutdownException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al apagar el producto", 500, details, userMessage)
  }
}

export class ProductDeleteException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al eliminar el producto", 500, details, userMessage)
  }
}

export class ProductGetAllException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super("Error al obtener los productos", 500, details, userMessage)
  }
}

export class UnauthorizedProductAccessException extends BaseException {
  constructor(details?: unknown, userMessage?: string) {
    super(
      "No tienes permisos para acceder a este reproducto",
      403,
      details,
      userMessage
    )
  }
}