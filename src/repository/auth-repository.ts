import {
  AuthCreationException,
  AuthLoginException,
  AuthLogoutException,
  AuthMissingUserException,
  AuthRecoverPasswordException,
  AuthResetPasswordException,
  AuthVerificationException,
} from "@/exceptions/auth/auth-exceptions"
import { ValidationException } from "@/exceptions/base/base-exceptions"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@/lib/supabase/admin-client"
import { LoginSchema, RegisterSchema } from "@/lib/validations/AuthSchema"
import {
  CreateOauthUserValues,
  CreateUserValues,
  LoginValues,
  RecoverPasswordValues,
  ResetPasswordValues,
  VerifyUserValues,
} from "@/types/auth/types"
import { PublicUser } from "@/types/types"

export class AuthRepository {
  async createUser(values: CreateUserValues): Promise<void> {
    const supabase = await createClient()

    const { email, name, password, phone } = values

    const validate_fields = RegisterSchema.safeParse(values)

    if (!validate_fields.success) {
      const fieldErrors: Record<string, string[]> = {}

      validate_fields.error.errors.forEach((error) => {
        const field = error.path.join(".")
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(error.message)
      })

      throw new ValidationException(
        validate_fields.error.message,
        fieldErrors,
        "Error de validación en los campos"
      )
    }

    const {
      data: { user },
      error: singUpError,
    } = await supabase.auth.signUp({
      email,
      password,
    })

    if (singUpError) {
      let userMessage = ""
      switch (singUpError?.code) {
        case "email_address_invalid":
          userMessage = "El correo electrónico no es válido."
          break
        case "email_exists":
          userMessage = "El correo electrónico ya está en uso."
          break

        case "bad_oauth_callback":
          userMessage = "Error al crear el usuario, intente nuevamente."
          break

        case "weak_password":
          userMessage = "La contraseña debe tener al menos 6 caracteres."
          break

        default:
          userMessage = "Error al crear el usuario, intente nuevamente."
      }

      throw new AuthCreationException(singUpError.message, userMessage)
    }

    const { error: tableError } = await supabase.from("users").insert({
      id: user?.id,
      email,
      name,
      phone,
    })

    if (tableError) {
      let userMessage = ""

      switch (tableError?.code) {
        case "23505":
          userMessage = "El correo electrónico ya está en uso."
          break
        default:
          userMessage = "Error al crear el usuario, intente nuevamente."
      }
      throw new AuthCreationException(tableError.message, userMessage)
    }

    return
  }

  async loginUser(values: LoginValues): Promise<void> {
    const supabase = await createClient()

    const { email, password } = values

    const validate_fields = LoginSchema.safeParse(values)

    if (!validate_fields.success) {
      const fieldErrors: Record<string, string[]> = {}

      validate_fields.error.errors.forEach((error) => {
        const field = error.path.join(".")
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(error.message)
      })

      throw new ValidationException(
        validate_fields.error.message,
        fieldErrors,
        "Error de validación en los campos"
      )
    }
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      let userMessage = ""
      switch (loginError?.code) {
        case "invalid_credentials":
          userMessage = "Las credenciales son incorrectas."
          break
        default:
          userMessage = "Error al iniciar sesión, intente nuevamente."
      }

      throw new AuthLoginException(loginError.message, userMessage)
    }

    return
  }

  async logoutUser(): Promise<void> {
    const supabase = await createClient()

    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) {
      let userMessage = ""

      switch (logoutError?.code) {
        case "not_authenticated":
          userMessage = "No hay una sesión iniciada."
          break
        default:
          userMessage = "Error al cerrar sesión, intente nuevamente."
      }

      throw new AuthLogoutException(logoutError.message, userMessage)
    }

    return
  }

  async getUser(): Promise<PublicUser> {
    const supabase = await createClient()

    const { data, error: userError } = await supabase.auth.getUser()

    if (userError) {
      let userMessage = ""
      switch (userError?.code) {
        case "not_authenticated":
          userMessage = "No hay una sesión iniciada."
          break
        default:
          userMessage = "Error al obtener el usuario, intente nuevamente."
      }

      throw new AuthMissingUserException(userError.message, userMessage)
    }

    const user = data.user

    if (!user) {
      throw new AuthMissingUserException(
        "No se pudo obtener el usuario",
        "No se pudo obtener el usuario"
      )
    }

    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("*")
      .eq("email", user.email)
      .single()

    if (userDataError?.code) {
      let userMessage = ""
      switch (userDataError?.code) {
        case "not_found":
          userMessage = "No se pudo obtener el usuario"
          break
        default:
          userMessage = "Error al obtener el usuario, intente nuevamente."
      }

      throw new AuthMissingUserException(userDataError.message, userMessage)
    }

    if (!userData) {
      throw new AuthMissingUserException(
        "No se pudo obtener el usuario",
        "No se pudo obtener el usuario"
      )
    }

    return userData
  }

  async createOauthUser(values: CreateOauthUserValues): Promise<void> {
    const supabase = await createClient()

    const { error: createError } = await supabase.from("users").upsert(values)

    if (createError) {
      let userMessage = ""
      switch (createError?.code) {
        case "email_address_invalid":
          userMessage = "El correo electrónico no es válido."
          break
        case "email_exists":
          userMessage = "El correo electrónico ya está en uso."
          break
        default:
          userMessage = "Error al crear el usuario, intente nuevamente."
      }

      throw new AuthCreationException(createError.message, userMessage)
    }

    return
  }

  async verifyUser(values: VerifyUserValues): Promise<void> {
    const supabase = await createClient()

    const { email, code } = values

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    })

    if (verifyError) {
      let userMessage = ""
      switch (verifyError?.code) {
        case "invalid_token":
          userMessage = "El código de verificación es inválido."
          break
        default:
          userMessage = "Error al verificar el usuario, intente nuevamente."
      }

      throw new AuthVerificationException(verifyError.message, userMessage)
    }

    return
  }

  async recoverPassword(values: RecoverPasswordValues): Promise<void> {
    const supabase = await createClient()

    const { email } = values

    if (!email) {
      throw new AuthRecoverPasswordException(
        "El correo electrónico es requerido",
        "El correo electrónico es requerido"
      )
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: "https://localhost:3000.com.ar/reset-password",
      }
    )

    if (resetError) {
      let userMessage = ""
      switch (resetError?.code) {
        case "email_not_found":
          userMessage = "El correo electrónico no está registrado."
          break
        case "invalid_email":
          userMessage = "El correo electrónico no es válido."
          break
        case "email_address_not_authorized":
          userMessage = "El correo electrónico no está autorizado."
          break
        case "email_not_confirmed":
          userMessage = "El correo electrónico no está confirmado."
          break
        default:
          userMessage = "Error al recuperar la contraseña, intente nuevamente."
      }

      throw new AuthRecoverPasswordException(resetError.message, userMessage)
    }

    return
  }

  async resetPassword(values: ResetPasswordValues): Promise<void> {
    const supabase = await createClient()

    const { password } = values

    if (!password) {
      throw new AuthResetPasswordException(
        "La contraseña es requerida",
        "La contraseña es requerida"
      )
    }

    const { error: resetError } = await supabase.auth.updateUser({
      password,
    })

    if (resetError) {
      let userMessage = ""
      switch (resetError?.code) {
        case "invalid_password":
          userMessage = "La contraseña no es válida."
          break
        case "bad_jwt":
          userMessage =
            "Error al restablecer la contraseña, intente nuevamente."
          break
        case "invalid_token":
          userMessage = "El token de restablecimiento es inválido."
          break
        case "otp_expired":
          userMessage = "El código de restablecimiento ha expirado."
          break
        case "weak_password":
          userMessage = "La contraseña debe tener al menos 6 caracteres."
          break
        default:
          userMessage =
            "Error al restablecer la contraseña, intente nuevamente."
      }

      throw new AuthResetPasswordException(resetError.message, userMessage)
    }

    return
  }

  async getUserById(id: string): Promise<PublicUser> {
    const supabase = await createAdminClient()

    const { data, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single()

    if (userError) {
      throw new AuthMissingUserException(userError.message, userError.message)
    }

    return data as PublicUser
  }
}