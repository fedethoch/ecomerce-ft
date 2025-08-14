import {
  PaymentException,
  PaymentPreferenceDataNotFoundException,
} from "@/exceptions/payment/payment-exceptions"
import { AuthService } from "@/services/auth-service"
import { ProductsRepository } from "@/repository/products-repository"
import { OrdersService } from "@/services/orders-service"
import { Order } from "@/types/orders/types"
import {
  CreatePreferenceResponse,
  CreatePreferenceValues,
  UpdatePreferenceValues,
} from "@/types/payment/types"
import MercadoPagoConfig, { Preference } from "mercadopago"
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes"
import { EmailService } from "./email-service"

const authService = new AuthService()
const productsRepository = new ProductsRepository()
const ordersService = new OrdersService()
const emailService = new EmailService()
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export class PaymentService {
  private readonly client: Preference

  constructor() {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN as string
    if (!accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN is not set")
    }
    const config = new MercadoPagoConfig({ accessToken })
    this.client = new Preference(config)
  }

  // ✅ Soporta carrito multi-ítem. Crea la orden primero y usa order.id como external_reference.
  async createPreference(body: CreatePreferenceValues): Promise<CreatePreferenceResponse> {
    const { payment_method, items } = body

    if (!payment_method) {
      throw new PaymentPreferenceDataNotFoundException(
        "Datos de preferencia de pago incompletos",
        "Faltan datos para crear la preferencia de pago"
      )
    }

    if (payment_method !== "mercadopago") {
      throw new PaymentException(
        "Método de pago no soportado",
        "Solo Mercado Pago está disponible por ahora"
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new PaymentPreferenceDataNotFoundException(
        "Carrito vacío",
        "No hay productos para pagar"
      )
    }

    const user = await authService.getUser()
    if (!user) {
      throw new PaymentPreferenceDataNotFoundException(
        "Usuario no encontrado",
        "No se encontró un usuario"
      )
    }

    // Cargar productos y validar cantidades
    const lines = await Promise.all(
      items.map(async ({ product_id, quantity }) => {
        if (!product_id || !quantity || quantity <= 0) {
          throw new PaymentPreferenceDataNotFoundException(
            "Ítem inválido",
            "Producto o cantidad inválidos"
          )
        }
        const product = await productsRepository.getProduct(product_id)
        if (!product) {
          throw new PaymentPreferenceDataNotFoundException(
            "Producto no encontrado",
            "No se encontró un producto del carrito"
          )
        }
        return { product, quantity }
      })
    )

    // Calcular total (ajusta si sumás envío/impuestos/descuentos)
    const total = lines.reduce((acc, { product, quantity }) => acc + product.price * quantity, 0)

    try {
      // 1) Crear la ORDEN primero (estado pendiente hasta confirmar pago)
      const order = await ordersService.createOrder({
        user_id: user.id,
        total_amount: total,
        status: "pending",
        // Si agregaste columnas:
        // payment_provider: "mercadopago",
      })

      // 2) Insertar items de la orden (snapshot de precio)
      await Promise.all(
        lines.map(({ product, quantity }) =>
          ordersService.createOrderItem({
            order_id: order.id,
            product_id: product.id,
            quantity,
            price: round2(product.price),
            // Si tu modelo lo contempla: product_name, image_url, etc.
          })
        )
      )

      // 3) Crear preferencia de MP con external_reference = order.id
      const pref = (await this.client.create({
        body: {
          items: lines.map(({ product, quantity }) => ({
            id: product.id,
            title: product.name,
            quantity,
            currency_id: "ARS",
            unit_price: round2(product.price),
          })),
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
          },
          auto_return: "approved",
          external_reference: order.id, // 🔑 clave para actualizar luego
          metadata: { order_id: order.id, user_id: user.id },
        },
      })) as PreferenceResponse

      if (!pref || !pref.init_point) {
        throw new PaymentPreferenceDataNotFoundException(
          "Error al crear la preferencia de pago",
          "No se pudo crear la preferencia de pago"
        )
      }

      // (Opcional) Guardar el id de preferencia si tenés columna
      // try {
      //   await ordersService.updateOrder({
      //     ...order,
      //     payment_intent_id: pref.id,
      //     payment_provider: "mercadopago",
      //   } as Order)
      // } catch (_) {}

      return { init_point: pref.init_point }
    } catch (error) {
      console.error(error)
      throw new PaymentException(
        "Error al crear la preferencia de pago",
        "No se pudo crear la preferencia de pago"
      )
    }
  }

  // ✅ Actualiza usando external_reference === order.id
  async updatePreferenceByExternalReference(body: UpdatePreferenceValues): Promise<void> {
    const { external_reference, payment_id, collection_status } = body

    if (!external_reference || !payment_id || !collection_status) {
      throw new PaymentPreferenceDataNotFoundException(
        "Datos de preferencia de pago incompletos",
        "Faltan datos para actualizar la preferencia de pago"
      )
    }

    // Como external_reference = order.id, traemos la orden directamente
    const order = await ordersService.getOrder(external_reference)
    if (!order) {
      throw new PaymentPreferenceDataNotFoundException(
        "Orden no encontrada",
        "No se encontró una orden con la referencia externa proporcionada"
      )
    }

    if (order.status === "approved") {
      return
    }

    // Mapear estado reportado por MP al estado interno
    const newStatus = collection_status === "approved" ? "approved" : "pending"

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      // Si tu modelo tiene campos para payment_id/collection_status, podés setearlos aquí.
      // payment_id,
      // collection_status,
    }

    await ordersService.updateOrder(updatedOrder)

    // Si fue aprobado, enviar email de confirmación
    if (collection_status === "approved") {
      const user = await authService.getUserById(order.user_id)
      if (!user) {
        throw new PaymentPreferenceDataNotFoundException(
          "Usuario no encontrado",
          "No se encontró un usuario"
        )
      }

      const orderWithDetails = await ordersService.getOrder(order.id)
      const orderItem = orderWithDetails?.order_items?.[0]
      if (!orderItem) {
        throw new PaymentPreferenceDataNotFoundException(
          "Producto no encontrado en la orden",
          "No se encontró un producto en la orden"
        )
      }

      const product = orderItem.product
      const image =
        Array.isArray(product?.imagePaths) && product.imagePaths.length > 0
          ? product.imagePaths[0]
          : undefined

      await emailService.sendEmail({
        customerName: user.name,
        customerEmail: user.email,
        productName: product?.name ?? "Tu compra",
        productImage: image ?? "",
        price: String(order.total_amount),
        orderId: order.id,
        purchaseDate: new Date(order.created_at).toISOString(),
        accessUrl: "", // si aplica (digital)
      })
    }

    return
  }
}
