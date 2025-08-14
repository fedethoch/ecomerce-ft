// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
import 
// Agrega credenciales
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });



export function payment() {
    const preference = new Preference(client)
        .create({
            items: {
                id: "pago",
                title: FormData.title,
                description: FormData.description,
                quantity: FormData.quantity,
                currency_id: FormData.currency_id,
                unit_price: FormData.unit_price
            }
        })


    return (
        <>
        </>
    )
}