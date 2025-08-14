import { MercadoPagoConfig, Preference } from 'mercadopago';
import { redirect } from 'next/navigation';



const client = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

export async function pagoMercadoPago() {
    "use server"

    const preference = await new Preference(client)
        .create({
            body: {
                items: [{
                id: "pruebaTest",
                title: "Prueba de producto",
                description: "Descripción del producto",
                quantity: 1,
                currency_id: "ARS",
                unit_price: 1000
                }]
            }
        })
    redirect(preference.sandbox_init_point!)
}