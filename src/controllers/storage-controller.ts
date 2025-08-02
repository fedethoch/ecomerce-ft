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

export async function uploadProductImage(file: File, productId: string) {
  return await actionHandler(async () => {
    const uploadResult = await storageService.uploadProductImage(file, productId)
    return uploadResult.url
  })
}