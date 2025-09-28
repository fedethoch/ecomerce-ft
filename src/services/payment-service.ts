// src/services/payment-service.ts
import {
  PaymentException,
  PaymentPreferenceDataNotFoundException,
} from "@/exceptions/payment/payment-exceptions"
import { AuthService } from "@/services/auth-service"
import { ProductsRepository } from "@/repository/products-repository"
import { OrdersService } from "@/services/orders-service"
import { Order } from "@/types/orders/types"
import type { OrderWithDetails } from "@/types/orders/types"
import {
  CreatePreferenceResponse,
  CreatePreferenceValues,
  UpdatePreferenceValues,
} from "@/types/payment/types"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes"
import { EmailService } from "./email-service"

// PayPal
import checkoutNodeJssdk from "@paypal/checkout-server-sdk"

// Shipping (ojo: singular)
import { ShippingService } from "./shipping-services"
import { AddressInput } from "@/types/shipping/types"

const authService = new AuthService()
const productsRepository = new ProductsRepository()
const ordersService = new OrdersService()
const emailService = new EmailService()
const shippingService = new ShippingService()

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

// Helper PayPal
function getPayPalClient() {
  const env = (process.env.PAYPAL_ENV || "sandbox").toLowerCase()
  const clientId = process.env.PAYPAL_CLIENT_ID as string
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET as string
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET is not set")
  }
  const Environment =
    env === "live"
      ? checkoutNodeJssdk.core.LiveEnvironment
      : checkoutNodeJssdk.core.SandboxEnvironment

  const paypalEnv = new Environment(clientId, clientSecret)
  return new checkoutNodeJssdk.core.PayPalHttpClient(paypalEnv)
}

export class PaymentService {
  private readonly mpClient: Preference

  constructor() {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN as string
    if (!accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN is not set")
    }
    const config = new MercadoPagoConfig({ accessToken })
    this.mpClient = new Preference(config)
  }
  private async loadItems(items: { product_id: string; quantity: number }[]) {
  // ⚠️ reconstruí título y unit_price desde tu DB por seguridad
  // return [{ title, unit_price, quantity }]
  }

  private async verifyCostByMethodId(methodId: string): Promise<number> {
    // ⚠️ validá contra tu tabla/tarifario (NO confíes en el front)
    // ej: if (methodId === "andreani_std") return 3499;
    // throw si el id no existe
    return 0;
  }

  private buildExternalRef(input: { shipping_id: string; ts: number }) {
    // Evitá reutilizar preferencias cuando cambia el envío
    return `order-${input.shipping_id}-${input.ts}`;
  }
  // MP + PayPal. Incluye cálculo de envío.
  async createPreference(body: CreatePreferenceValues): Promise<CreatePreferenceResponse> {
    const { payment_method, items } = body

    if (!payment_method) {
      throw new PaymentPreferenceDataNotFoundException("Método no enviado", "Falta método de pago")
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new PaymentPreferenceDataNotFoundException("Carrito vacío", "No hay productos para pagar")
    }

    const user = await authService.getUser()
    if (!user) {
      const err: any = new PaymentPreferenceDataNotFoundException("Usuario no encontrado", "Debes iniciar sesión")
      err.code = "AUTH_REQUIRED"
      throw err
    }

    // 1) Cargar productos y validar (igual que tenías)
    const lines = await Promise.all(
      items.map(async ({ product_id, quantity }) => {
        if (!product_id || !quantity || quantity <= 0) {
          throw new PaymentPreferenceDataNotFoundException("Ítem inválido", "Producto o cantidad inválidos")
        }
        const product = await productsRepository.getProduct(product_id)
        if (!product) {
          throw new PaymentPreferenceDataNotFoundException("Producto no encontrado", "No se encontró un producto del carrito")
        }
        return { product, quantity }
      })
    )

    const subtotalARS = round2(lines.reduce((acc, { product, quantity }) => acc + product.price * quantity, 0))

    // 2) Envío: RESPETAR ELECCIÓN
    const address = (body as any).address as AddressInput | undefined
    const chosenMethodId = (body as any).shipping_method_id as string | undefined
    if (!chosenMethodId) {
      throw new PaymentPreferenceDataNotFoundException("Envío no seleccionado", "Elegí un método de envío")
    }

    const isPickup = chosenMethodId === "pickup"

    let shippingAmountARS = 0
    if (!isPickup) {
      // Para carrier SÍ exigimos dirección
      if (!address?.state || !address?.postal_code) {
        throw new PaymentPreferenceDataNotFoundException("Dirección incompleta", "Completá provincia y código postal")
      }

      // Cotizamos y buscamos EXACTAMENTE el método elegido
      try {
        const shippingOptions = await shippingService.quote(
          items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
          address,
          { declaredValueARS: subtotalARS }
        )
        const chosen = shippingOptions.find(o => o.method_id === chosenMethodId)
        if (!chosen) {
          throw new PaymentPreferenceDataNotFoundException(
            "Método de envío inválido",
            "La opción de envío elegida ya no está disponible. Volvé a seleccionar."
          )
        }
        shippingAmountARS = round2(chosen.amount)
      } catch (e) {
        // Si falla la cotización, no forzamos un carrier diferente
        throw new PaymentPreferenceDataNotFoundException(
          "Error al cotizar envío",
          "No se pudo cotizar el envío; por favor, volvé a seleccionar el método."
        )
      }
    } else {
      // pickup: costo $0 y NO cotizamos
      shippingAmountARS = 0
    }

    const totalARS = round2(subtotalARS + shippingAmountARS)

    // 3) Según método de pago (Mercado Pago)
    switch (payment_method) {
      case "mercadopago": {
        try {
          const order = await ordersService.createOrder({
            user_id: user.id,
            total_amount: totalARS,
            status: "pending",
            shipping_amount: shippingAmountARS,
            shipping_method_id: isPickup ? null : null,
          } as Partial<Order> as Order)

          await Promise.all(
            lines.map(({ product, quantity }) =>
              ordersService.createOrderItem({
                order_id: order.id,
                product_id: product.id,
                quantity,
                price: round2(product.price),
              })
            )
          )

          const mpItems = [
            ...lines.map(({ product, quantity }) => ({
              id: product.id,
              title: product.name,
              quantity,
              currency_id: "ARS",
              unit_price: round2(product.price),
            })),
          ] as any[]

          // 👇 Sólo agregamos "Envío" como ítem si NO es pickup y el costo > 0
          if (!isPickup && shippingAmountARS > 0) {
            mpItems.push({
              id: "shipping",
              title: "Envío",
              quantity: 1,
              currency_id: "ARS",
              unit_price: round2(shippingAmountARS),
            })
          }

          const pref = (await this.mpClient.create({
            body: {
              items: mpItems,
              back_urls: {
                success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
                failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
              },
              auto_return: "approved",
              external_reference: order.id,
              metadata: {
                order_id: order.id,
                user_id: user.id,
                shipping_method_id: chosenMethodId ?? null,
                shipping_amount: shippingAmountARS,
                is_pickup: isPickup,
              },
              notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago`,
            },
          })) as PreferenceResponse

          if (!pref?.init_point) {
            throw new PaymentPreferenceDataNotFoundException("Error MP", "No se pudo crear la preferencia de pago")
          }

          return { init_point: pref.init_point }
        } catch (error: any) {
          const status = error?.status ?? error?.error?.status ?? 502
          const providerMsg =
            error?.error?.message || error?.message || "No se pudo crear la preferencia de pago en Mercado Pago"

          const ex: any = new PaymentException("Error al crear la preferencia de pago", providerMsg)
          ex.name = "PaymentException"
          ex.statusCode = status
          ex.provider = "mercadopago"
          ex.raw = error
          console.error("[MP] createPreference error:", providerMsg, error)
          throw ex
        }
      }

      case "paypal": {
        try {
          const rate = Number(process.env.PAYPAL_USD_RATE || "1000")
          const toUSD = (ars: number) => round2(ars / rate)

          const subtotalUSD = toUSD(subtotalARS)
          const shippingUSD = toUSD(shippingAmountARS)
          const totalUSD = round2(subtotalUSD + shippingUSD)

          const order = await ordersService.createOrder({
            user_id: user.id,
            total_amount: totalUSD,
            status: "pending",
          } as Partial<Order> as Order)

          await Promise.all(
            lines.map(({ product, quantity }) =>
              ordersService.createOrderItem({
                order_id: order.id,
                product_id: product.id,
                quantity,
                price: toUSD(product.price),
              })
            )
          )

          const client = getPayPalClient()
          const req = new checkoutNodeJssdk.orders.OrdersCreateRequest()
          req.prefer("return=representation")
          req.requestBody({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: totalUSD.toFixed(2),
                },
                custom_id: order.id,
              },
            ],
            application_context: {
              return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/paypal/success`,
              cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/paypal/cancel`,
            },
          })

          const res = await client.execute(req)
          const approve = (res?.result?.links as any[])?.find((l) => l.rel === "approve")?.href
          if (!approve) {
            throw new PaymentPreferenceDataNotFoundException("Error PayPal", "No se pudo crear la orden de PayPal")
          }

          return { init_point: approve }
        } catch (error: any) {
          const status = error?.statusCode ?? 502
          const providerMsg =
            error?.result?.message || error?.message || "No se pudo crear la orden en PayPal"

          const ex: any = new PaymentException("Error al crear la orden de PayPal", providerMsg)
          ex.name = "PaymentException"
          ex.statusCode = status
          ex.provider = "paypal"
          ex.raw = error
          console.error("[PayPal] createOrder error:", providerMsg, error)
          throw ex
        }
      }

      default:
        throw new PaymentException("Método de pago no soportado", "Elegí un método de pago válido")
    }
  }

  // Capturar PayPal
  async capturePayPalOrder(token: string) {
    if (!token) {
      throw new PaymentPreferenceDataNotFoundException("Token faltante", "Falta token de PayPal")
    }
    const client = getPayPalClient()
    const req = new checkoutNodeJssdk.orders.OrdersCaptureRequest(token)
    req.requestBody({})
    const res = await client.execute(req)
    return res?.result?.status as string | undefined // "COMPLETED"
  }

  // Mercado Pago: actualizar usando external_reference === order.id
  async updatePreferenceByExternalReference(body: UpdatePreferenceValues): Promise<void> {
    const { external_reference, payment_id, collection_status } = body

    if (!external_reference || !payment_id || !collection_status) {
      throw new PaymentPreferenceDataNotFoundException(
        "Datos de preferencia de pago incompletos",
        "Faltan datos para actualizar la preferencia de pago"
      )
    }

    const order = await ordersService.getOrder(external_reference)
    if (!order) {
      throw new PaymentPreferenceDataNotFoundException(
        "Orden no encontrada",
        "No se encontró una orden con la referencia externa proporcionada"
      )
    }

    if (order.status === "success") return

    const newStatus = collection_status === "approved" ? "success" : "pending"
    const updatedOrder: Order = { ...order, status: newStatus }
    await ordersService.updateOrder(updatedOrder)

    if (collection_status === "approved") {
      const user = await authService.getUserById(order.user_id)
      if (!user) {
        throw new PaymentPreferenceDataNotFoundException("Usuario no encontrado", "No se encontró un usuario")
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
        accessUrl: "",
      })

      // Emisión de etiqueta (no bloqueante)
      try {
        const shippingSvc = new ShippingService()

        

        const [addr, fullOrder] = await Promise.all([
          ordersService.getOrderAddress(order.id),
          ordersService.getOrder(order.id),
        ]);
        if (!addr) {
          console.log("[Shipping] Orden sin dirección (pickup): no se emite etiqueta.");
          return;
        }

        type ChosenOption = {
          method_id: string
          label: string
          amount: number
          provider: string
          service_level: "standard" | "express" | "pickup"
        }

        let chosen: ChosenOption | null = null
        const savedMethodId = (order as any).shipping_method_id as string | undefined
        if (savedMethodId === "pickup") {
          console.log("[Shipping] Orden con retiro en local: no se emite etiqueta.")
          return
        }
        const savedAmount = Number((order as any).shipping_amount ?? 0)

        if (savedMethodId) {
          chosen = {
            method_id: String(savedMethodId),
            label: "Envío",
            amount: savedAmount,
            provider: "andreani",
            service_level: "standard",
          }
        }

        if (!chosen || !(chosen.amount >= 0)) {
          const quoteOpts = await shippingSvc.quote(
            fullOrder.order_items.map((oi: OrderWithDetails["order_items"][number]) => ({
              product_id: oi.product_id,
              quantity: oi.quantity,
              weight_grams: oi.product?.weightGrams,
            })),
            addr
          )
          if (!quoteOpts?.length) throw new Error("No se obtuvieron cotizaciones de envío")

          const opt = quoteOpts.find(o => o.method_id === savedMethodId) ?? quoteOpts[0]
          chosen = {
            method_id: opt.method_id,
            label: opt.label,
            amount: opt.amount,
            provider: opt.provider ?? "andreani",
            service_level: opt.service_level,
          }
        }

        const buyRes = await shippingSvc.buyLabelForOrder({
          order_id: order.id,
          address: addr,
          option: chosen,
          items: fullOrder.order_items.map((oi: OrderWithDetails["order_items"][number]) => ({
            product_id: oi.product_id,
            quantity: oi.quantity,
            weight_grams: oi.product?.weightGrams,
          })),
        })

        await ordersService.createShipment({
          order_id: order.id,
          carrier: buyRes.carrier,
          service_level: buyRes.service_level,
          tracking_number: buyRes.tracking_number,
          label_url: buyRes.label_url,
          amount_customer: chosen.amount,
        })
      } catch (shipErr) {
        console.error("[Shipping] No se pudo emitir etiqueta:", shipErr)
      }
    }
  }
}
