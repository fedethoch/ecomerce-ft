// src/services/email-service.ts
import { Resend } from "resend"
import { createElement } from "react"
import { renderAsync } from "@react-email/render" // 👈 usa la versión async
import { PurchaseConfirmationTemplate } from "@/components/email-templates/buy-templates"
import { EmailSendingException } from "@/exceptions/emails/emails-exceptions"
import type { EmailBody } from "@/types/email/types"

function sanitizeKey(k?: string | null) {
  return (k || "").replace(/^["']|["']$/g, "")
}
function summarizeResendError(err: any) {
  try {
    return JSON.stringify(
      {
        name: err?.name,
        message: err?.message,
        statusCode: err?.statusCode ?? err?.status ?? err?.response?.status,
        code: err?.code,
        type: err?.type,
        body: err?.body ?? err?.data ?? err?.error ?? undefined,
      },
      null,
      2,
    )
  } catch {
    return String(err)
  }
}

export class EmailService {
  private readonly resend: Resend
  private readonly from: string

  constructor() {
    const rawKey = sanitizeKey(process.env.RESEND_API_KEY)
    if (!rawKey) throw new Error("RESEND_API_KEY is not set")
    this.resend = new Resend(rawKey)
    this.from = process.env.EMAIL_FROM || "Tu Tienda <onboarding@resend.dev>"
  }

  async sendEmail(body: EmailBody): Promise<void> {
    const { customerName, customerEmail, productName, productImage, price, orderId, purchaseDate, accessUrl } = body

    const absoluteImage = productImage && /^https?:\/\//i.test(productImage) ? productImage : undefined

    // 👇 render async: devuelve Promise<string>
    const element = createElement(PurchaseConfirmationTemplate, {
      customerName,
      customerEmail,
      productName,
      productImage: absoluteImage,
      price,
      orderId,
      purchaseDate,
      accessUrl,
    })
    const html = await renderAsync(element)

    // 1) intento con FROM configurado
    const first = await this.resend.emails.send({
      from: this.from,
      to: customerEmail,
      subject: "✨ ¡Confirmación de Compra! Tu pedido está en camino",
      html, // <- string
    })

    if (!first.error) return

    console.error("[Resend] error primer intento:", summarizeResendError(first.error))

    const msg = String(first.error?.message || "").toLowerCase()
    const errAny: any = first.error ?? {}
    const status = Number(errAny.statusCode ?? errAny.status ?? errAny.response?.status ?? 0)
    const likelyFromIssue =
      msg.includes("domain") || msg.includes("from") || msg.includes("not verified") || [401, 403, 422].includes(status)

    // 2) fallback con remitente de Resend si el dominio no está verificado
    if (likelyFromIssue && !/onboarding@resend\.dev/i.test(this.from)) {
      const fallback = await this.resend.emails.send({
        from: "Tu Tienda <onboarding@resend.dev>",
        to: customerEmail,
        subject: "✨ ¡Confirmación de Compra! Tu pedido está en camino",
        html,
      })
      if (!fallback.error) return
      console.error("[Resend] error fallback onboarding:", summarizeResendError(fallback.error))
    }

    // 3) último recurso: texto plano
    const plain = await this.resend.emails.send({
      from: /onboarding@resend\.dev/i.test(this.from) ? this.from : "Tu Tienda <onboarding@resend.dev>",
      to: customerEmail,
      subject: "Confirmación de tu pedido",
      text: `Hola ${customerName},

¡Gracias por tu compra! Tu pedido ha sido confirmado y pronto estará en camino.

DETALLES DE TU PEDIDO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Número de pedido: ${orderId}
Producto: ${productName}
Total: ${price}
Fecha de compra: ${purchaseDate}
${accessUrl ? `\nSeguimiento: ${accessUrl}` : ""}

Recibirás un correo con el número de seguimiento una vez que tu pedido sea enviado.

Si tienes alguna pregunta, no dudes en contactarnos.

¡Gracias por confiar en nosotros!

— Tu Tienda`,
    })

    if (!plain.error) return

    console.error("[Resend] texto plano también falló:", summarizeResendError(plain.error))
    throw new EmailSendingException(plain.error, "Error al enviar el email")
  }
}
