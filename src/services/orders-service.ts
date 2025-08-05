import { OrdersRepository } from "@/repository/orders-repository"
import { OrderWithDetails } from "@/types/orders/types"

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
}