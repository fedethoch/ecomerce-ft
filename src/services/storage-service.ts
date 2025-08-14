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

  async uploadProductImage(files: File[] | File, productId: string): Promise<UploadResult[]> {
    const user = await authService.getUser()
    if (!user) throw new UnauthorizedException("Usuario no autenticado");
    // if (user.type_role !== "admin") {
    //    throw new ForbiddenException("Usuario no autorizado")
    //  }
    const filesArray = Array.isArray(files) ? files : [files];
    filesArray.forEach(this.validateImageFile);
    // 1. Normalizar nombres
    const safeProductName = productId
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .toLowerCase();
    
    // 2. Normalizar nombre de archivo
    
    
    
    // 3. Generar path seguro
      const timestamp = Date.now();
      
      
   


    return this.storageRepository.uploadMultipleFiles(
      filesArray,
      productId,
      "products-images",
      `products/${safeProductName}`,
      { contentType: filesArray[0]?.type, upsert: true }
    );
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