"use server"

import { actionHandler } from "@/lib/handlers/actionHandler"
import { AuthService } from "@/services/auth-service"
import {
  CreateOauthUserValues,
  CreateUserValues,
  LoginValues,
  RecoverPasswordValues,
  ResetPasswordValues,
  VerifyUserValues,
} from "@/types/auth/types"

const authService = new AuthService()

export const createUser = async (values: CreateUserValues) => {
  return actionHandler(async () => {
    await authService.createUser(values)
  })
}

export const loginUser = async (values: LoginValues) => {
  return actionHandler(async () => {
    await authService.loginUser(values)
  })
}

export const logoutUser = async () => {
  return actionHandler(async () => {
    await authService.logoutUser()
  })
}

export const getUser = async () => {
  return actionHandler(async () => {
    const user = await authService.getUser()

    return user
  })
}

export const createOauthUser = async (values: CreateOauthUserValues) => {
  return actionHandler(async () => {
    await authService.createOauthUser(values)
  })
}

export const verifyUser = async (values: VerifyUserValues) => {
  return actionHandler(async () => {
    await authService.verifyUser(values)
  })
}

export const recoverPassword = async (values: RecoverPasswordValues) => {
  return actionHandler(async () => {
    await authService.recoverPassword(values)
  })
}

export const resetPassword = async (values: ResetPasswordValues) => {
  return actionHandler(async () => {
    await authService.resetPassword(values)
  })
}

export const getUserById = async (id: string) => {
  return actionHandler(async () => {
    const user = await authService.getUserById(id)

    return user
  })
}