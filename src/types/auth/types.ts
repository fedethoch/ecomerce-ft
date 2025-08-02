export interface CreateUserValues {
  email: string
  password: string
  name: string
  phone: string
  
}

export interface LoginValues {
  email: string
  password: string
}

export interface CreateOauthUserValues {
  id: string
  email: string
  name: string
}

export interface VerifyUserValues {
  email: string
  code: string
}

export interface RecoverPasswordValues {
  email: string
}

export interface ResetPasswordValues {
  password: string
}

