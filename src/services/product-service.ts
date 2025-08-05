import { ProductsRepository } from "@/repository/products-repository"
import { ProductType } from "@/types/products/products"
import { AuthService } from "./auth-service"
import { StorageService } from "./storage-service"
import {
  ProductCreationException,
  UnauthorizedProductAccessException,
} from "@/exceptions/products/products-exceptions"

const authService = new AuthService();
const storageService = new StorageService();

export class ProductService {
  private async getRepository() {
    return new ProductsRepository();
  }

  private readonly productsRepository: ProductsRepository

  constructor() {
    this.productsRepository = new ProductsRepository();
  }


  async createProduct(
    values: Omit<ProductType, "id" | "image">,
    imageFile: File
  ): Promise<ProductType> {
    try {
      console.log("Creando producto con valores:", values);
      
      const user = await authService.getUser();
      console.log("Usuario autenticado:", user);

      if (!user) {
        throw new ProductCreationException(
          "No se pudo obtener el usuario.",
          "Debe estar autenticado para crear un producto."
        );
      }

      console.log("Subiendo imagen...");
      const uploadResult = await storageService.uploadProductImage(
        imageFile, 
        values.name
      );
      console.log("Imagen subida:", uploadResult.url);

      console.log("Creando producto en DB...");
      const createdProduct = await this.productsRepository.createProduct({
        ...values,
        image: [uploadResult.url],
      });
      
      console.log("Producto creado en DB:", createdProduct);
      return createdProduct;
    } catch (error) {
      console.error("Error en service.createProduct:", error);
      throw error;
    }
  }

  async getProducts(): Promise<ProductType[]> {
    const productsRepository = await this.getRepository();
    return productsRepository.getProducts();
  }

  async getProduct(id: string): Promise<ProductType | null> {
    const productsRepository = await this.getRepository();
    return productsRepository.getProduct(id);
  }

  async getAllProducts(): Promise<ProductType[]> {
    const authService = new AuthService();
    const user = await authService.getUser();

    if (!user) {
      throw new UnauthorizedProductAccessException(
        "No se pudo obtener el usuario.",
        "Debe estar autenticado para ver todos los productos."
      );
    }

    if (user.role !== "admin") {
      throw new UnauthorizedProductAccessException(
        "No tiene permisos para ver todos los productos.",
        "Debe ser administrador para ver todos los productos."
      );
    }

    const productsRepository = await this.getRepository();
    return productsRepository.getAllProducts();
  }

  async updateProduct(id: string, updates: Partial<Omit<ProductType, "id">>) {
    const productsRepository = await this.getRepository();
    return productsRepository.updateProduct(id, updates);
  }

  async deleteProduct(id: string) {
    const productsRepository = await this.getRepository();
    return productsRepository.deleteProduct(id);
  }
}