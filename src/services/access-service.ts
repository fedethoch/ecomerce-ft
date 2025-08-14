import {
  AccessDataNotProvidedException,
  AccessDeniedException
} from "@/exceptions/access/access-exceptions"
import { AuthService } from "./auth-service"
import { OrdersService } from "./orders-service"

const ordersService = new OrdersService()
const authService = new AuthService()

export class AccessService {
  // Verifica si el usuario tiene acceso a un producto comprado
  async checkProductAccess(productId: string, userId: string): Promise<boolean> {
    if (!productId || !userId) {
      throw new AccessDataNotProvidedException(
        "No se proporcionaron datos de acceso"
      )
    }

    const user = await authService.getUser()

    if (!user) {
      throw new AccessDeniedException("El usuario no está autenticado")
    }

    // Busca órdenes del usuario que incluyan el producto
    const orders = await ordersService.getOrders()
    const hasProduct = orders.some(order =>
      order.user_id === user.id &&
      order.order_items.some(item => item.product_id === productId)
    )

    if (!hasProduct) {
      if (user.type_role === "admin") {
        return true
      } else {
        throw new AccessDeniedException("El usuario no tiene acceso al producto")
      }
    }

    return true
  }

  async checkUserAccess(): Promise<boolean> {
    const user = await authService.getUser()

    if (!user) {
      throw new AccessDeniedException("El usuario no está autenticado")
    }

    if (user.type_role !== "admin") {
      throw new AccessDeniedException("El usuario no tiene acceso")
    }

    return true
  }

  async checkUserHasProductBought(productId: string): Promise<boolean> {
    const user = await authService.getUser()

    if (!user) {
      throw new AccessDeniedException("El usuario no está autenticado")
    }

    const orders = await ordersService.getOrders()
    const hasProduct = orders.some(order =>
      order.user_id === user.id &&
      order.order_items.some(item => item.product_id === productId)
    )

    return hasProduct
  }
}