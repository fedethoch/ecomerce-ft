export const runtime = "nodejs";

import { PaymentService } from "@/services/payment-service";
import { MercadoPagoConfig, Payment } from "mercadopago";

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;

// Helper: leer body como JSON o urlencoded sin explotar
async function readBody(req: Request): Promise<any> {
  const text = await req.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    try {
      return Object.fromEntries(new URLSearchParams(text));
    } catch {
      return {};
    }
  }
}

// Normaliza id y topic desde headers, query y body
function extractIdAndTopic(req: Request, body: any) {
  const url = new URL(req.url);
  const qp = url.searchParams;

  const topicHeader = req.headers.get("x-mercadopago-topic") || "";
  const topic =
    body?.type ||
    body?.topic ||
    qp.get("type") ||
    qp.get("topic") ||
    topicHeader ||
    "";

  // MP puede mandar: body.data.id, body.id, ?data.id=..., ?id=...
  const paymentId =
    body?.data?.id ||
    body?.id ||
    qp.get("data.id") ||
    qp.get("id") ||
    null;

  return { topic: String(topic).toLowerCase(), paymentId: paymentId ? String(paymentId) : null };
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await readBody(req);
    const { topic, paymentId } = extractIdAndTopic(req, body);

    // Solo nos interesa payment.* y que haya id
    if (!paymentId || (topic && !topic.includes("payment"))) {
      // Respondemos 200 para evitar reintentos infinitos por payloads no relevantes
      return new Response("OK", { status: 200 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentApi = new Payment(client);

    // Puede fallar si el id aún no está listo -> devolvemos 200 igual y MP reintenta
    let paymentDetails: Awaited<ReturnType<typeof paymentApi.get>> | null = null;
    try {
      paymentDetails = await paymentApi.get({ id: paymentId });
    } catch (e) {
      console.warn("[MP webhook] payment.get falló, id:", paymentId, e);
      return new Response("OK", { status: 200 });
    }

    const collection_status =
      (paymentDetails.status as "pending" | "approved" | "rejected" | "in_process" | "cancelled" | "refunded") ??
      "pending";

    const external_reference = paymentDetails.external_reference ?? "";

    if (!external_reference) {
      console.warn("[MP webhook] falta external_reference para payment", paymentId);
      return new Response("OK", { status: 200 });
    }

    // Actualiza la orden (usa Service Role adentro y mapea approved -> success)
    const svc = new PaymentService();
    await svc.updatePreferenceByExternalReference({
      external_reference,
      payment_id: String(paymentDetails.id ?? paymentId),
      collection_status,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[MP webhook] error inesperado:", error);
    // 200 para que MP no te martillee si hubo un edge-case del server
    return new Response("OK", { status: 200 });
  }
}

// MP a veces hace GET para healthcheck
export async function GET() {
  return new Response("OK", { status: 200 });
}