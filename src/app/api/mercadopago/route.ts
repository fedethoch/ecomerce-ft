export const runtime = "nodejs";

import { MercadoPagoConfig, Payment, MerchantOrder } from "mercadopago";
import { PaymentService } from "@/services/payment-service";

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;
if (!accessToken) throw new Error("MERCADO_PAGO_ACCESS_TOKEN no seteado");

// ---- Helpers -------------------------------------------------
async function readBody(req: Request): Promise<any> {
  const text = await req.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch {}
  try { return Object.fromEntries(new URLSearchParams(text)); } catch {}
  return {};
}

function extractPaymentIdFromResource(resource?: string | null): string | null {
  if (!resource) return null;
  const m = /\/payments\/(\d+)/i.exec(resource); // ej: https://api.mercadopago.com/v1/payments/123
  return m?.[1] ?? null;
}

function extractIdAndTopic(req: Request, body: any) {
  const url = new URL(req.url);
  const qp = url.searchParams;

  const topicHeader =
    req.headers.get("x-mercadopago-topic") ||
    req.headers.get("x-topic") ||
    "";

  const topic = String(
    body?.type || body?.topic || qp.get("type") || qp.get("topic") || topicHeader || ""
  ).toLowerCase();

  const paymentId =
    body?.data?.id ||
    body?.id ||
    qp.get("data.id") ||
    qp.get("id") ||
    extractPaymentIdFromResource(body?.resource) ||
    null;

  return { topic, paymentId: paymentId ? String(paymentId) : null };
}
// ---------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  // Siempre devolver 200 para que MP no “martillee” si hay edge-cases
  try {
    const body = await readBody(req);
    const { topic, paymentId } = extractIdAndTopic(req, body);

    console.log("[MP webhook] hit", {
      topic, paymentId, keys: Object.keys(body || {})
    });

    // Si vino merchant_order sin id de pago, igual intentamos por MerchantOrder
    const client = new MercadoPagoConfig({ accessToken });

    let external_reference = "";
    let mp_status: string | undefined;
    let mp_payment_id: string | undefined;
    let paid_amount: number | undefined;

    if (topic.includes("merchant_order")) {
      const moId =
        paymentId ||
        body?.resource?.split("/").pop() ||
        new URL(req.url).searchParams.get("id");

      if (moId) {
        const mo = new MerchantOrder(client);
        const moData = await mo.get({ merchantOrderId: String(moId) });
        external_reference = moData.external_reference ?? "";
        const last = moData.payments?.[moData.payments.length - 1];
        if (last) {
          mp_status = last.status;
          mp_payment_id = String(last.id);
          paid_amount = last.total_paid_amount ?? undefined;
        }
      }
    }

    // Si no hay info todavía, o el topic es payment, vamos por Payment
    if (!external_reference) {
      const pid =
        paymentId ||
        body?.data?.id ||
        extractPaymentIdFromResource(body?.resource) ||
        null;

      if (!pid) {
        console.warn("[MP webhook] sin paymentId ni external_reference aún");
        return new Response("OK", { status: 200 });
      }

      const paymentApi = new Payment(client);
      try {
        const p = await paymentApi.get({ id: String(pid) });
        external_reference = p.external_reference ?? "";
        mp_status = p.status;
        mp_payment_id = String(p.id ?? pid);
        paid_amount = (p as any)?.transaction_amount ?? undefined;
      } catch (e) {
        console.warn("[MP webhook] payment.get falló", pid, e);
        return new Response("OK", { status: 200 });
      }
    }

    if (!external_reference || !mp_payment_id) {
      console.warn("[MP webhook] falta external_reference o payment_id");
      return new Response("OK", { status: 200 });
    }

    const svc = new PaymentService();

    // Idempotencia: permitir transiciones (pending→approved). Usamos clave compuesta paymentId:status
    const eventKey = `${mp_payment_id}:${mp_status ?? "unknown"}`;
    const already = await svc.wasWebhookEventProcessed(eventKey);
    if (already) {
      return new Response("OK", { status: 200 });
    }

    await svc.updatePreferenceByExternalReference({
      external_reference,
      payment_id: mp_payment_id,
      collection_status: (mp_status as any) ?? "pending",
      paid_amount,
      raw_topic: topic || "payment",
    });

    await svc.markWebhookEventProcessed(eventKey);

    console.log("[MP webhook] updated", { external_reference, mp_status, mp_payment_id });
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[MP webhook] error inesperado:", error);
    return new Response("OK", { status: 200 });
  }
}

export async function GET() {
  return new Response("OK", { status: 200 });
}
