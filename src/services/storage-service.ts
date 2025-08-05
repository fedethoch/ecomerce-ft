import { StorageRepository } from "@/repository/storage-repository"
import { UploadResult, UploadFileOptions } from "@/types/storage/types"
import {
  InvalidFileTypeException,
  FileSizeExceededException,
} from "@/exceptions/storage/storage-exceptions"
import { AuthService } from "@/services/auth-service"
import {
  ForbiddenException,
  UnauthorizedException,
} from "@/exceptions/base/base-exceptions"

const authService = new AuthService()

export class StorageService {
  private storageRepository: StorageRepository

  constructor() {
    this.storageRepository = new StorageRepository()
  }


  private validateImageFile(file: Blob): void {
    if (file.type && !file.type.startsWith("image/")) {
      throw new InvalidFileTypeException(
        `Invalid file type: ${file.type}`,
        "Solo se permiten archivos de imagen"
      )
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new FileSizeExceededException(
        `File size ${file.size} exceeds maximum ${maxSize}`,
        "La imagen excede el tamaño máximo permitido (5MB)"
      )
    }
  }

  async uploadProductImage(file: File, productId: string): Promise<UploadResult> {
    const user = await authService.getUser()

    if (!user) {
      throw new UnauthorizedException("Usuario no autenticado")
    }

    if (user.role !== "admin") {
      throw new ForbiddenException("Usuario no autorizado")
    }

    this.validateImageFile(file)

    return this.storageRepository.uploadFile({
      file,
      productId,
      bucket: "products-images",
      options: { upsert: true },
    })
  }


  async deleteFile(path: string, bucket: string): Promise<void> {
    return this.storageRepository.deleteFile({ path, bucket })
  }

  async getPublicUrl(path: string, bucket: string): Promise<string> {
    return this.storageRepository.getPublicUrl({ path, bucket })
  }

  

  async uploadImage(file: File): Promise<string> {
    this.validateImageFile(file)

    const url = await this.storageRepository.uploadImage(file)

    return url
  }
}