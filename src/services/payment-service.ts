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
import { createClient } from "@supabase/supabase-js"
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

// ====== URL helpers para back_urls / webhooks ======
const strip = (u?: string | null) => (u ?? "").replace(/\/+$/, "")
const resolveAppUrl = () => {
  const base =
    strip(process.env.NEXT_PUBLIC_APP_URL) ||
    strip(process.env.APP_URL) ||
    (process.env.VERCEL_URL ? `https://${strip(process.env.VERCEL_URL)}` : "http://localhost:3000")
  return /^https?:\/\//i.test(base) ? base : `https://${base}`
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // 👈 usa tu nombre de env
);



// ====== PayPal helper ======
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

    // 1) Cargar productos y validar
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

    // 2) Envío: respetar la elección del usuario
    const address = (body as any).address as AddressInput | undefined
    const chosenMethodId = (body as any).shipping_method_id as string | undefined
    if (!chosenMethodId) {
      throw new PaymentPreferenceDataNotFoundException("Envío no seleccionado", "Elegí un método de envío")
    }

    const isPickup = chosenMethodId === "pickup"

    let shippingAmountARS = 0
    if (!isPickup) {
      if (!address?.state || !address?.postal_code) {
        throw new PaymentPreferenceDataNotFoundException("Dirección incompleta", "Completá provincia y código postal")
      }
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
      } catch {
        throw new PaymentPreferenceDataNotFoundException(
          "Error al cotizar envío",
          "No se pudo cotizar el envío; por favor, volvé a seleccionar el método."
        )
      }
    } else {
      shippingAmountARS = 0
    }

    const totalARS = round2(subtotalARS + shippingAmountARS)
    const appUrl = resolveAppUrl()

    // 3) Según método de pago
    switch (payment_method) {
      case "mercadopago": {
        try {
          // ⚠️ shipping_method_id en DB es UUID → NO guardamos "pickup"/strings
          const order = await ordersService.createOrder({
            user_id: user.id,
            total_amount: totalARS,
            status: "pending",
            shipping_amount: shippingAmountARS,
            shipping_method_id: null, // <— clave del fix (evita 22P02)
          } as Partial<Order> as Order)

          await Promise.all(
            lines.map(({ product, quantity }) =>
              ordersService.createOrderItem({
                order_id: order.id,
                product_id: product.id,
                quantity,
                price: round2(product.price),
                unit_price: round2(product.price),
                product_name: product.name,
                currency: "ARS",
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
              payer: { email: user.email },
              back_urls: {
                success: `${appUrl}/payment/success`,
                failure: `${appUrl}/payment/failure`,
                pending: `${appUrl}/payment/pending`,
              },
              notification_url: `${appUrl}/api/mercadopago`,
              auto_return: "approved",
              external_reference: order.id,
              metadata: {
                order_id: order.id,
                user_id: user.id,
                shipping_method_code: chosenMethodId ?? null, // <— guardamos el código aquí
                shipping_amount: shippingAmountARS,
                is_pickup: isPickup,
              },
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
          const cause = Array.isArray(error?.error?.cause) ? error.error.cause : []

          console.error("[MP] createPreference error:", {
            status,
            message: providerMsg,
            cause,
            raw: error?.error ?? error,
          })

          const ex: any = new PaymentException("Error al procesar el pago", providerMsg)
          ex.name = "PaymentException"
          ex.statusCode = status
          ex.provider = "mercadopago"
          ex.raw = error
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
                unit_price: toUSD(product.price),
                product_name: product.name,
                currency: "USD",
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
                amount: { currency_code: "USD", value: totalUSD.toFixed(2) },
                custom_id: order.id,
              },
            ],
            application_context: {
              return_url: `${appUrl}/payment/paypal/success`,
              cancel_url: `${appUrl}/payment/paypal/cancel`,
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

          console.error("[PayPal] createOrder error:", providerMsg, error)

          const ex: any = new PaymentException("Error al crear la orden de PayPal", providerMsg)
          ex.name = "PaymentException"
          ex.statusCode = status
          ex.provider = "paypal"
          ex.raw = error
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

  async wasWebhookEventProcessed(event_id: string) {
    const { data, error } = await supabaseAdmin
      .from("mp_webhook_events")
      .select("event_id")
      .eq("event_id", event_id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    return Boolean(data);
  }

  async markWebhookEventProcessed(event_id: string) {
    const { error } = await supabaseAdmin
      .from("mp_webhook_events")
      .insert({ event_id, processed_at: new Date().toISOString() });

    if (error && error.code !== "23505") throw error; // ignora unique_violation
  }



  // Mercado Pago: actualizar usando external_reference === order.id
  async updatePreferenceByExternalReference(body: UpdatePreferenceValues & {
    paid_amount?: number
    raw_topic?: string
  }): Promise<void> {
    const { external_reference, payment_id, collection_status } = body
    if (!external_reference || !payment_id || !collection_status) {
      throw new PaymentPreferenceDataNotFoundException(
        "Datos de preferencia de pago incompletos",
        "Faltan datos para actualizar la preferencia de pago"
      )
    }

    // 1) Traer orden
    const order = await ordersService.getOrderAdmin(external_reference)
    if (!order) {
      throw new PaymentPreferenceDataNotFoundException(
        "Orden no encontrada",
        "No se encontró una orden con la referencia externa proporcionada"
      )
    }

    // 2) Mapeo MP -> Dominio (DB)
    type OrderLifecycleStatus = "pending" | "success" | "cancelled" | "flagged"
    type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "charged_back"

    let newStatus: OrderLifecycleStatus = "pending"
    let newPayStatus: PaymentStatus = "pending"

    switch (collection_status) {
      case "approved":
        newStatus = "success"
        newPayStatus = "paid"
        break
      case "in_process":
      case "authorized":
        newStatus = "pending"
        newPayStatus = "pending"
        break
      case "rejected":
      case "cancelled":
        newStatus = "cancelled"
        newPayStatus = "failed"
        break
      case "refunded":
        newStatus = "cancelled"
        newPayStatus = "refunded"
        break
      case "charged_back":
        newStatus = "flagged"
        newPayStatus = "charged_back"
        break
      default:
        newStatus = "pending"
        newPayStatus = "pending"
    }

    // 3) No degradar si ya estaba success
    if (order.status === "success" && newStatus !== "success") {
      return
    }

    // 4) Persistir SOLO columnas existentes en tu tabla 'orders'
    await ordersService.updateOrderFieldsAdmin(external_reference, {
      status: newStatus,
      payment_status: newPayStatus,
      payment_provider: "mercadopago",
      payment_intent_id: String(payment_id),
      // Si en el futuro agregás columnas “raw”, las sumás acá.
    } as Partial<Order>)

    // 5) Efectos: email + shipping si aprobado (lo tuyo ya estaba armado, lo dejo)
    if (newPayStatus === "paid") {
      const user = await authService.getUserById(order.user_id)
      if (user) {
        try {
          const orderWithDetails = await ordersService.getOrderAdmin(order.id)
          const orderItem = orderWithDetails?.order_items?.[0]
          const product = orderItem?.product
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
        } catch (e) {
          console.error("[Email] no se pudo enviar confirmación:", e)
        }

        // (opcional) etiqueta de envío — lo dejé igual que tu versión, no lo repito acá
      }
    }
  }
}
