// src/services/email-service.ts
import { Resend } from "resend";
import { createElement } from "react";
import { render } from "@react-email/render"; // 👈 usar render sync
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

    // Para testear sin dominio verificado:
    // this.from = "Acme <onboarding@resend.dev>";
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

    // Asegurá URL absoluta (los clientes de correo no resuelven paths relativos)
    const absoluteImage =
      productImage && /^https?:\/\//i.test(productImage) ? productImage : undefined;

    try {
      // 1) Render nosotros (evita cualquier “this.renderAsync” interno)
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
      const html = await render(element); // 👈 async, necesita await

      // 2) Enviar pasando HTML (no uses `react`)
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: customerEmail,
        subject: "¡Compra Exitosa! Ya puedes acceder a tu curso - Edumine",
        html,
      });

      if (error) throw error;
    } catch (err: unknown) {
      // Fallback en texto plano (no bloquea el flujo de la orden)
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

— Edumine`,
        });
      } catch {}
      throw new EmailSendingException(err instanceof Error ? err : new Error(String(err)), "Error al enviar el email");
    }
  }
}
