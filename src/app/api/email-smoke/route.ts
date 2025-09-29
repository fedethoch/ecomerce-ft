export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { EmailService } from "@/services/email-service";

export async function GET() {
  try {
    await new EmailService().sendEmail({
      customerName: "Smoke",
      customerEmail: process.env.TEST_EMAIL || "you@example.com",
      productName: "Hola Mundo",
      productImage: "https://via.placeholder.com/300x200?text=Test+Product",
      price: "$0.00",
      orderId: "SMOKE-TEST",
      purchaseDate: new Date().toISOString(),
      accessUrl: "https://example.com",
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
