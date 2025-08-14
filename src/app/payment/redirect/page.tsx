import { pagoMercadoPago } from "@/components/payments/mercado_pago";

export default function RedirectPage() {
    return (
        <form action={pagoMercadoPago} className="m-auto grid w-96 gap-8 border p-4">
            <button type="submit">
                Redirigir a Mercado Pago
            </button>
        </form>
    );
}