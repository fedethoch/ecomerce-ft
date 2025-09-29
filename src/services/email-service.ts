// src/services/email-service.ts
import { Resend } from "resend";
import { createElement } from "react";
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

    // Permite override por env si querés usar otro remitente en preview
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

    try {
      // ✅ Render vía Resend pasando un React Element (sin renderAsync)
      const reactEmail = createElement(PurchaseConfirmationTemplate, {
        customerName,
        customerEmail,
        productName,
        productImage,
        price,
        orderId,
        purchaseDate,
        accessUrl,
      });

      const { error } = await this.resend.emails.send({
        from: this.from,
        to: customerEmail,
        subject: "¡Compra Exitosa! Ya puedes acceder a tu curso - Edumine",
        react: reactEmail,
      });

      if (error) throw error;
    } catch (err: any) {
      // Fallback de cortesía en texto plano (no bloquea el flujo de orden)
      try {
        await this.resend.emails.send({
          from: this.from,
          to: customerEmail,
          subject: "Confirmación de compra - Edumine",
          text:
`Hola ${customerName},

¡Gracias por tu compra!

Pedido: ${orderId}
Producto: ${productName}
Precio: ${price}
Fecha: ${purchaseDate}
Acceso: ${accessUrl || "-"}

Este es un mail de confirmación automático.

— Edumine`,
        });
      } catch {
        // ignoramos el error del fallback, arrojamos el original envuelto
      }
      throw new EmailSendingException(err, "Error al enviar el email");
    }
  }
}
