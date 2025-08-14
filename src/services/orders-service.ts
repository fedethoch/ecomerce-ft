import { OrdersRepository } from "@/repository/orders-repository"
import { Order, OrderItem, OrderWithDetails } from "@/types/orders/types"

export class OrdersService {
  private repository = new OrdersRepository()

  async getOrders(): Promise<OrderWithDetails[]> {
    return this.repository.getOrders()
  }

  async getOrder(id: string): Promise<OrderWithDetails | null> {
    return this.repository.getOrder(id)
  }

  async updateOrderStatus(id: string, status: string): Promise<OrderWithDetails> {
    return this.repository.updateOrderStatus(id, status) as Promise<OrderWithDetails>
  }

  // NUEVOS MÉTODOS PARA PAYMENT SERVICE

  async createOrder(order: Partial<Order>): Promise<Order> {
    return this.repository.createOrder(order)
  }

  async getOrderByExternalReference(external_reference: string): Promise<Order | null> {
    return this.repository.getOrderByExternalReference(external_reference)
  }

  async updateOrder(order: Order): Promise<Order> {
    return this.repository.updateOrder(order)
  }

  async createOrderItem(orderItem: Partial<OrderItem>): Promise<OrderItem> {
    return this.repository.createOrderItem(orderItem)
  }
}