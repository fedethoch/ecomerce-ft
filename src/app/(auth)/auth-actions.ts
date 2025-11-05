"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client"; // Asumo que tienes este archivo por tu 'orders-repository'

export async function handlePasswordResetRequest(
  email: string,
  redirectUrl: string
) {
  // Cliente público para enviar el correo
  const supabase = createClient();
  // Cliente Admin para inspeccionar al usuario
  const supabaseAdmin = createAdminClient();

  // 1. Verificamos si el usuario existe
  const { data: userData, error: userError } =
    await supabaseAdmin.auth.admin.getUserByEmail(email);

  if (userError || !userData) {
    // IMPORTANTE: Por seguridad (para evitar "enumeración de correos"),
    // siempre devolvemos un mensaje de éxito, incluso si el correo no existe.
    console.warn(
      `Intento de reseteo para correo inexistente: ${email}`,
      userError?.message
    );
    return { success: true, message: "Si la cuenta existe, se envió un correo." };
  }

  // 2. Revisamos las "identidades" del usuario
  const user = userData.user;
  const hasPasswordIdentity = user.identities?.some(
    (identity) => identity.provider === "email"
  );
  const hasGoogleIdentity = user.identities?.some(
    (identity) => identity.provider === "google"
  );

  // 3. Decidimos qué hacer
  if (hasGoogleIdentity && !hasPasswordIdentity) {
    // CASO: El usuario SÓLO se registró con Google.
    return {
      success: false,
      error: "google_account",
      message:
        "Esta cuenta está vinculada con Google. Por favor, inicia sesión usando Google.",
    };
  }

  // CASO: El usuario tiene una contraseña (o ambas).
  // Procedemos a enviar el correo de reseteo.
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: redirectUrl,
    }
  );

  if (resetError) {
    return { success: false, error: resetError.message };
  }

  // Éxito
  return { success: true, message: "¡Correo enviado! Revisa tu bandeja de entrada." };
}   