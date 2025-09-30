// src/services/email-service.ts
import nodemailer from "nodemailer";
import { createElement } from "react";
import { renderAsync } from "@react-email/render";
import { PurchaseConfirmationTemplate } from "@/components/email-templates/buy-templates";
import { EmailSendingException } from "@/exceptions/emails/emails-exceptions";
import type { EmailBody } from "@/types/email/types";

// === Helpers de entorno (obligatorios) =======================
function must(name: string, val?: string | null) {
  if (!val) throw new Error(`${name} is not set`);
  return val;
}
const SMTP_HOST = must("SMTP_HOST", process.env.SMTP_HOST);
const SMTP_PORT = Number(process.env.SMTP_PORT || "587");
const SMTP_USER = must("SMTP_USER", process.env.SMTP_USER);
const SMTP_PASS = must("SMTP_PASS", process.env.SMTP_PASS);
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;          // remitente visible
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;  // opcional

// === Transport reusado (pool) =================================
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true si usás 465 (SSL), false en 587 (STARTTLS)
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  tls: { minVersion: "TLSv1.2" },
});

function summarizeSmtpError(err: any) {
  try {
    return JSON.stringify(
      {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        command: err?.command,
        response: err?.response,
        responseCode: err?.responseCode,
      },
      null,
      2
    );
  } catch {
    return String(err);
  }
}

function textFallback(b: EmailBody) {
  return `Hola ${b.customerName},

¡Gracias por tu compra!

Pedido: ${b.orderId}
Producto: ${b.productName}
Precio: ${b.price}
Fecha: ${b.purchaseDate}
Acceso: ${b.accessUrl || "-"}

— Tu Tienda`;
}

export class EmailService {
  private readonly from = EMAIL_FROM;

  async sendEmail(body: EmailBody): Promise<void> {
    const html = await renderAsync(createElement(PurchaseConfirmationTemplate, body));

    try {
      await transporter.sendMail({
        from: this.from,
        to: body.customerEmail,
        subject: body.subject ?? "✨ ¡Confirmación de compra!",
        html,
        text: textFallback(body), // fallback por si el cliente bloquea HTML
        replyTo: EMAIL_REPLY_TO,
      });
    } catch (err: any) {
      console.error("[SMTP] send failed:", summarizeSmtpError(err));
      throw new EmailSendingException(err, "Error al enviar el email");
    }
  }
}
