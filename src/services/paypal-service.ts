// services/paypal-client.ts
import checkoutNodeJssdk from "@paypal/checkout-server-sdk"

export function getPayPalClient() {
  const env = (process.env.PAYPAL_ENV || "sandbox").toLowerCase()
  const clientId = process.env.PAYPAL_CLIENT_ID as string
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET as string
  if (!clientId || !clientSecret) throw new Error("PAYPAL CLIENT_ID/SECRET missing")

  const Environment =
    env === "live"
      ? checkoutNodeJssdk.core.LiveEnvironment
      : checkoutNodeJssdk.core.SandboxEnvironment

  const paypalEnv = new Environment(clientId, clientSecret)
  return new checkoutNodeJssdk.core.PayPalHttpClient(paypalEnv)
}
