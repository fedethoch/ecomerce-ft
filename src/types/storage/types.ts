export interface UploadFileOptions {
  contentType?: string
  upsert?: boolean
}

export interface UploadResult {
  path: string;
  url: string;
}

// Opción con compatibilidad
export interface UploadResult {
  path: string;
  url: string;
  filename?: string;    // Opcional
  productId?: string;   // Opcional
}

export interface UploadFileParams {
  file: File;
  bucket: string;
  path: string;
  filename?: string;    // Ahora opcional
  productId?: string;   // Ahora opcional
  options?: {
    contentType?: string;
    upsert?: boolean;
    cacheControl?: string;
  };
}

export interface DeleteFileParams {
  path: string
  bucket: string
}

export interface GetPublicUrlParams {
  path: string
  bucket: string
}