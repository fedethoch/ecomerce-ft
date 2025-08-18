// types/paypal-checkout-server-sdk.d.ts
declare module "@paypal/checkout-server-sdk" {
  namespace checkoutNodeJssdk {
    namespace core {
      class SandboxEnvironment {
        constructor(clientId: string, clientSecret: string)
      }
      class LiveEnvironment {
        constructor(clientId: string, clientSecret: string)
      }
      class PayPalHttpClient {
        constructor(env: any)
        execute(request: any): Promise<any>
      }
    }
    namespace orders {
      class OrdersCreateRequest {
        prefer(pref: string): void
        requestBody(body: any): void
      }
      class OrdersCaptureRequest {
        constructor(orderId: string)
        requestBody(body: any): void
      }
    }
  }
  export default checkoutNodeJssdk
}
