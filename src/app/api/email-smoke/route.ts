// app/api/email-smoke/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { EmailService } from "@/services/email-service";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function GET() {
  try {
    await new EmailService().sendEmail({
        customerName: "Smoke",
        customerEmail: process.env.TEST_EMAIL || "tu-mail@ejemplo.com",
        productName: "Hola Mundo",
        productImage: "https://via.placeholder.com/600x300",
        price: "$0",
        orderId: `SMOKE-${Date.now()}`,
        purchaseDate: new Date().toISOString(),
        accessUrl: `${appUrl}/orders/SMOKE-TEST`,
        });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
