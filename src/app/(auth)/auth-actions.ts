"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

export async function handlePasswordResetRequest(
  email: string,
  redirectUrl: string
) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient(); 

  // --- MODIFICACIÓN: Usar RPC para verificar identidades ---
  // 1. Verificamos si el usuario existe y obtenemos sus 'providers'
  const { data: identitiesData, error: rpcError } = await supabaseAdmin
    .rpc('get_user_identity_by_email', { user_email: email });

  if (rpcError) {
    console.warn(`Error en RPC get_user_identity_by_email: ${email}`, rpcError.message);
    // Devuelve éxito para no revelar si el usuario existe
    return { success: true, message: "Si la cuenta existe, se envió un correo." };
  }

  // Cast para la data (esperamos un array de {provider: string})
  const identities = identitiesData as { provider: string }[];

  if (!identities || identities.length === 0) {
    console.warn(`Intento de reseteo para correo inexistente: ${email}`);
    // Devuelve éxito para no revelar si el usuario existe
    return { success: true, message: "Si la cuenta existe, se envió un correo." };
  }
  // --- FIN DE LA MODIFICACIÓN ---

  // 2. Revisamos las "identidades" del usuario
  const hasPasswordIdentity = identities.some(
    (identity) => identity.provider === "email"
  );
  const hasGoogleIdentity = identities.some(
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
  return {
    success: true,
    message: "¡Correo enviado! Revisa tu bandeja de entrada.",
  };
}