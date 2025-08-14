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
  const supabase = await createClient();
  
  const { file, bucket, path, filename, productId, options } = params; // Usamos path directamente

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Subir el archivo
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || true,
        cacheControl: options?.cacheControl || '3600'
      });

    if (uploadError) {
      throw new FileUploadException(
        uploadError.message,
        "Error al subir el archivo"
      );
    }

    // 2. Verificar que data existe
    if (!data) {
      throw new FileUploadException(
        "Upload data is missing",
        "Error crítico: No se recibió información del archivo subido"
      );
    }

    // 3. Obtener URL pública (no firmada)
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (!publicUrlData?.publicUrl) {
      throw new FileUploadException(
        "Public URL generation failed",
        "Error al generar la URL pública"
      );
    }

    return {
      path: data.path,
      url: publicUrlData.publicUrl
    };
    
  } catch (error) {
    if (error instanceof FileUploadException) throw error;
    throw new StorageException(
      `Error inesperado: ${error instanceof Error ? error.message : String(error)}`,
      "Error crítico en el sistema de almacenamiento"
    );
  }
}

  async deleteFile(params: DeleteFileParams): Promise<void> {
    
    const supabase = await createClient()
    const { path, bucket, } = params

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
    path: string, // Requerido ahora va ANTES de opcionales
    filename: string,
    options?: { contentType?: string; upsert?: true }
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file, index) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const filename = file.name
        ? `${uniqueSuffix}-${file.name}`
        : `img-${uniqueSuffix}-${index}`;
      console.log("Intentando subir archivo:", filename);
      return this.uploadFile({
        file,
        bucket,
        path: `${path}/${filename}`, // Usa la ruta base + nombre de archivo
        productId,
        filename,
        options
      });
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error(`Error subiendo archivo ${filename}:`, error);
      throw new FileUploadException(
        `Multiple upload error: ${error instanceof Error ? error.message : String(error)}`,
        "Error al subir uno o más archivos"
      );
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
      .from("products-images")
      .getPublicUrl(data.path)

    return publicUrl.publicUrl
  }
}