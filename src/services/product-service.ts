  import { ProductsRepository } from "@/repository/products-repository"
  import { ProductType } from "@/types/products/products" // <-- Use correct type
  import { AuthService } from "./auth-service"
  import { StorageService } from "./storage-service"
  import {
    ProductCreationException,
    UnauthorizedProductAccessException,
  } from "@/exceptions/products/products-exceptions"

  const authService = new AuthService()
  export class ProductService {
    private readonly productsRepository: ProductsRepository

    constructor() {
      this.productsRepository = new ProductsRepository()
    }

    async createProduct(
      values: Omit<ProductType, "id" | "image">,
      imageFile: File
    ): Promise<ProductType> {
      const user = await authService.getUser();

      if (!user) {
        throw new ProductCreationException(
          "No se pudo obtener el usuario.",
          "Debe estar autenticado para crear un producto."
        );
      }

      const storageService = new StorageService();
      const uploadResult = await storageService.uploadProductImage(imageFile, values.name);

      const createdProduct = await this.productsRepository.createProduct({
        ...values,
        image: [uploadResult.url],
      });

      return createdProduct;
    }

    async getProducts(): Promise<ProductType[]> {
      return this.productsRepository.getProducts()
    }

    async getProduct(id: string): Promise<ProductType | null> {
      return this.productsRepository.getProduct(id)
    }

    async getAllProducts(): Promise<ProductType[]> {
      const user = await authService.getUser()

      if (!user) {
        throw new UnauthorizedProductAccessException(
          "No se pudo obtener el usuario.",
          "Debe estar autenticado para ver todos los productos."
        )
      }

      if (user.role !== "admin") {
        throw new UnauthorizedProductAccessException(
          "No tiene permisos para ver todos los productos.",
          "Debe ser administrador para ver todos los productos."
        )
      }

      return this.productsRepository.getAllProducts()
    }

    async updateProduct(id: string, updates: Partial<Omit<ProductType, "id">>) {
      return this.productsRepository.updateProduct(id, updates)
    }

    async deleteProduct(id: string) {
      return this.productsRepository.deleteProduct(id)
    }
  }