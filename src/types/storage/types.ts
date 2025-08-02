export interface UploadFileOptions {
  contentType?: string
  upsert?: boolean
}

export interface UploadResult {
  productId: string
  filename: string
  path: string
  url: string
}

export interface UploadFileParams {
  file: Blob
  productId: string
  filename?: string
  bucket: string
  options?: UploadFileOptions
}

export interface DeleteFileParams {
  path: string
  bucket: string
}

export interface GetPublicUrlParams {
  path: string
  bucket: string
}