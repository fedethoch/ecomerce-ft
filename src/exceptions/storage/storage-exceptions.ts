import { BaseException } from "@/exceptions/base/base-exceptions"

export class StorageException extends BaseException {
  constructor(
    message: string = "Storage error",
    userMessage: string = "Error en el almacenamiento de archivos"
  ) {
    super(message, 500, undefined, userMessage)
  }
}

export class FileUploadException extends BaseException {
  constructor(
    message: string = "File upload failed",
    userMessage: string = "Error al subir el archivo"
  ) {
    super(message, 500, undefined, userMessage)
  }
}

export class FileDeleteException extends BaseException {
  constructor(
    message: string = "File deletion failed",
    userMessage: string = "Error al eliminar el archivo"
  ) {
    super(message, 500, undefined, userMessage)
  }
}

export class FileNotFoundException extends BaseException {
  constructor(
    message: string = "File not found",
    userMessage: string = "Archivo no encontrado"
  ) {
    super(message, 404, undefined, userMessage)
  }
}

export class InvalidFileTypeException extends BaseException {
  constructor(
    message: string = "Invalid file type",
    userMessage: string = "Tipo de archivo no válido"
  ) {
    super(message, 400, undefined, userMessage)
  }
}

export class FileSizeExceededException extends BaseException {
  constructor(
    message: string = "File size exceeded",
    userMessage: string = "El tamaño del archivo excede el límite permitido"
  ) {
    super(message, 400, undefined, userMessage)
  }
}