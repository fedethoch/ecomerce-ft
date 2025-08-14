import { PurchaseConfirmationTemplate } from "@/components/email-templates/buy-templates"
import { EmailSendingException } from "@/exceptions/emails/emails-exceptions"
import { EmailBody } from "@/types/email/types"
import { Resend } from "resend"

export class EmailService {
  private readonly resend: Resend

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY)
  }

  async sendEmail(body: EmailBody): Promise<void> {
    const {
      customerName,
      customerEmail,
      productName,
      productImage,
      price,
      orderId,
      purchaseDate,
      accessUrl,
    } = body

    const { error } = await this.resend.emails.send({
      from: "Edumine <courses@edumine.com.ar>",
      to: customerEmail,
      subject: "¡Compra Exitosa! Ya puedes acceder a tu curso - Edumine",
      react: PurchaseConfirmationTemplate({
        customerName,
        customerEmail,
        productName,
        productImage,
        price,
        orderId,
        purchaseDate,
        accessUrl,
      }),
    })

    if (error) {
      throw new EmailSendingException(error, "Error al enviar el email")
    }

    return
  }
}