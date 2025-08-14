"use server"

import { actionHandler } from "@/lib/handlers/actionHandler"
import { StorageService } from "@/services/storage-service"

const storageService = new StorageService()

export async function uploadImage(file: File) {
  return await actionHandler(async () => {
    const imageUrl = await storageService.uploadImage(file)
    return imageUrl
  })
}

export async function uploadProductImages(files: File[], productId: string) {
  return await actionHandler(async () => {
    const uploadResults = await storageService.uploadProductImage(files, productId)
    // Devuelve un array de URLs de todas las imágenes subidas
    return uploadResults.map(result => result.url)
  })
}