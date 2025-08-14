import { PaymentService } from "@/services/payment-service"
import { MercadoPagoConfig, Payment } from "mercadopago"

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json()

    const payment_id = body.data.id as string
    const topic = body.type as string
    const paymentService = new PaymentService()

    const client = new MercadoPagoConfig({
      accessToken: accessToken,
    })

    const payment = new Payment(client)

    const paymentDetails = await payment.get({ id: payment_id })

    if (topic.includes("payment") && payment_id) {
      await paymentService.updatePreferenceByExternalReference({
        collection_status:
          (paymentDetails.status as "pending" | "approved" | "rejected") ??
          "pending",
        external_reference: paymentDetails.external_reference ?? "",
        payment_id: payment_id,
      })
    } else {
      return new Response("Not implemented", { status: 501 })
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response("Error", { status: 500 })
  }
}