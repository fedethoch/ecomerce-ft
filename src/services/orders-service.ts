import { OrdersRepository } from "@/repository/orders-repository"
import { Order, OrderItem, OrderWithDetails } from "@/types/orders/types"
import { Shipment, OrderAddress } from "@/types/shipping/types"
import { AddressInput } from "@/types/shipping/types"


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

  // ========= EXISTENTES =========
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

  async createOrderAddress(addr: { order_id: string } & AddressInput): Promise<OrderAddress> {
    return this.repository.createOrderAddress(addr)
  }

  async getOrderAddress(order_id: string): Promise<OrderAddress | null> {
    return this.repository.getOrderAddress(order_id)
  }

  async createShipment(input: {
    order_id: string
    carrier: string
    service_level?: string
    tracking_number: string
    label_url?: string
    amount_customer: number
    status?: string      
  }): Promise<Shipment> {
    return this.repository.createShipment(input)
  }

  async adminUpdateStatus(id: string, status: string): Promise<void> {
    return this.repository.updateOrderStatusAdmin(id, status);
  }

  async getOrderAdmin(id: string): Promise<OrderWithDetails | null> {
    return this.repository.getOrderAdmin(id)
  }

  async updateOrderAdmin(order: Order): Promise<Order> {
    return this.repository.updateOrderAdmin(order)
  }

  async getOrderAddressAdmin(order_id: string): Promise<OrderAddress | null> {
    return this.repository.getOrderAddressAdmin(order_id)
  }  
}
