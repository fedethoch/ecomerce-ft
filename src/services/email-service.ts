// src/services/email-service.ts
import { Resend } from "resend";
import { createElement } from "react";
import { renderAsync } from "@react-email/render";
import { PurchaseConfirmationTemplate } from "@/components/email-templates/buy-templates";
import { EmailSendingException } from "@/exceptions/emails/emails-exceptions";
import type { EmailBody } from "@/types/email/types";

export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not set");
    this.resend = new Resend(apiKey);

    // Usá un remitente verificado en Resend; para pruebas podés usar onboarding@resend.dev
    this.from = process.env.EMAIL_FROM || "Edumine <courses@edumine.com.ar>";
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
    } = body;

    // Aseguramos URL absoluta para la imagen (los clientes de mail no resuelven paths relativos)
    const absoluteImage =
      productImage && /^https?:\/\//i.test(productImage)
        ? productImage
        : undefined;

    try {
      // 1) Renderizamos nosotros el HTML (evita el bug de this.renderAsync)
      const element = createElement(PurchaseConfirmationTemplate, {
        customerName,
        customerEmail,
        productName,
        productImage: absoluteImage,
        price,
        orderId,
        purchaseDate,
        accessUrl,
      });
      const html = await renderAsync(element);

      // 2) Enviamos pasando html (sin 'react')
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: customerEmail,
        subject: "¡Compra Exitosa!",
        html,
      });

      if (error) throw error;
    } catch (err: any) {
      // Fallback de cortesía en texto plano
      try {
        await this.resend.emails.send({
          from: this.from,
          to: customerEmail,
          subject: "Confirmación de compra - StyleHub",
          text:
`Hola ${customerName},

¡Gracias por tu compra!

Pedido: ${orderId}
Producto: ${productName}
Precio: ${price}
Fecha: ${purchaseDate}
Acceso: ${accessUrl || "-"}

— Edumine`,
        });
      } catch (_) { /* ignoramos el error del fallback */ }

      throw new EmailSendingException(err, "Error al enviar el email");
    }
  }
}
