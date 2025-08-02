import { createClient } from "@/lib/supabase/server"
import {
  UploadFileParams,
  DeleteFileParams,
  GetPublicUrlParams,
  UploadResult,
} from "@/types/storage/types"
import {
  FileUploadException,
  FileDeleteException,
  FileNotFoundException,
  StorageException,
} from "@/exceptions/storage/storage-exceptions"

export class StorageRepository {
  async uploadFile(params: UploadFileParams): Promise<UploadResult> {
    const supabase = await createClient()
    const { file, productId, filename, bucket, options } = params;
    ;

    try {
      const finalFilename =
        filename || (file instanceof File ? file.name : `file-${Date.now()}`)

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const storagePath = `products/${productId || "general"}/${finalFilename}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: options?.contentType || file.type,
          upsert: options?.upsert || false,
        })

      if (error) {
        throw new FileUploadException(
          error.message,
          "Error al subir el archivo al almacenamiento"
        )
      }

      if (!data) {
        throw new FileUploadException(
          "No data returned from upload",
          "Error al subir el archivo: no se recibieron datos"
        )
      }

      const { data: publicUrl } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 60 * 60 * 24 * 30)

      if (!publicUrl?.signedUrl) {
        throw new FileUploadException(
          "No signed URL returned from createSignedUrl",
          "Error al obtener la URL firmada del archivo"
        )
      }

      return {
        productId,
        filename: finalFilename,
        path: data.path,
        url: publicUrl.signedUrl,
      }
    } catch (error) {
      if (error instanceof FileUploadException) {
        throw error
      }
      throw new StorageException(
        `Storage upload error: ${error}`,
        "Error en el sistema de almacenamiento"
      )
    }
  }

  async deleteFile(params: DeleteFileParams): Promise<void> {
    const supabase = await createClient()
    const { path, bucket } = params

    try {
      const { error } = await supabase.storage.from(bucket).remove([path])

      if (error) {
        throw new FileDeleteException(
          error.message,
          "Error al eliminar el archivo del almacenamiento"
        )
      }
    } catch (error) {
      if (error instanceof FileDeleteException) {
        throw error
      }
      throw new StorageException(
        `Storage delete error: ${error}`,
        "Error en el sistema de almacenamiento"
      )
    }
  }

  async getPublicUrl(params: GetPublicUrlParams): Promise<string> {
    const supabase = await createClient()
    const { path, bucket } = params

    try {
      const { data } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60 * 24 * 30)

      if (!data?.signedUrl) {
        throw new FileNotFoundException(
          "Public URL not found",
          "No se pudo obtener la URL pública del archivo"
        )
      }

      return data.signedUrl
    } catch (error) {
      if (error instanceof FileNotFoundException) {
        throw error
      }
      throw new StorageException(
        `Storage URL error: ${error}`,
        "Error al obtener la URL del archivo"
      )
    }
  }

  async uploadMultipleFiles(
    files: File[],
    productId: string,
    bucket: string,
    options?: { contentType?: string; upsert?: boolean }
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file, index) => {
      const filename = file instanceof File ? file.name : `img-${Date.now()}-${index}`;

      return this.uploadFile({
        file,
        productId,
        filename,
        bucket,
        options,
      })
    })

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new FileUploadException(
        `Multiple upload error: ${error}`,
        "Error al subir uno o más archivos"
      )
    }
  }

  async uploadImage(file: File): Promise<string> {
    const supabase = await createClient()
    const filename = file.name

    const storagePath = `products/${filename}`;

    const { data, error } = await supabase.storage
    .from("products-images") // Nuevo bucket
    .upload(storagePath, file, {
      upsert: true,
    });

    if (error) {
      throw new FileUploadException(error.message, "Error al subir la imagen")
    }

    const { data: publicUrl } = supabase.storage
      .from("courses-images")
      .getPublicUrl(data.path)

    return publicUrl.publicUrl
  }
}