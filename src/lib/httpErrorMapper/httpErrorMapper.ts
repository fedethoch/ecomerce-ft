import {
  ForbiddenException,
  InvalidInputException,
  NotFoundException,
  UnauthorizedException,
  DatabaseException,
} from "@/exceptions/base/base-exceptions"
import {
  StorageException,
  FileUploadException,
  FileDeleteException,
  FileNotFoundException,
  InvalidFileTypeException,
  FileSizeExceededException,
} from "@/exceptions/storage/storage-exceptions"

/**
 * Maps custom exceptions to HTTP status codes.
 * @param error - The error object to map.
 * @returns The corresponding HTTP status code.
 */
export function getHttpStatusCode(error: unknown): number {
  if (
    error instanceof NotFoundException ||
    error instanceof FileNotFoundException
  ) {
    return 404
  } else if (
    error instanceof InvalidInputException ||
    error instanceof InvalidFileTypeException ||
    error instanceof FileSizeExceededException
  ) {
    return 400
  } else if (error instanceof UnauthorizedException) {
    return 401
  } else if (error instanceof ForbiddenException) {
    return 403
  } else if (
    error instanceof DatabaseException ||
    error instanceof StorageException ||
    error instanceof FileUploadException ||
    error instanceof FileDeleteException
  ) {
    return 500
  }

  return 500 // Default to internal server error for unknown exceptions
}