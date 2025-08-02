import { AuthRepository } from "@/repository/auth-repository"
import {
  CreateOauthUserValues,
  CreateUserValues,
  LoginValues,
  RecoverPasswordValues,
  ResetPasswordValues,
  VerifyUserValues,
} from "@/types/auth/types"
import { PublicUser } from "@/types/types"

export class AuthService {
  private readonly authRepository: AuthRepository

  constructor() {
    this.authRepository = new AuthRepository()
  }

  async createUser(values: CreateUserValues): Promise<void> {
    await this.authRepository.createUser(values)
  }

  async loginUser(values: LoginValues): Promise<void> {
    await this.authRepository.loginUser(values)
  }

  async logoutUser(): Promise<void> {
    await this.authRepository.logoutUser()
  }

  async getUser(): Promise<PublicUser> {
    return this.authRepository.getUser()
  }

  async createOauthUser(values: CreateOauthUserValues): Promise<void> {
    await this.authRepository.createOauthUser(values)
  }

  async verifyUser(values: VerifyUserValues): Promise<void> {
    await this.authRepository.verifyUser(values)
  }

  async recoverPassword(values: RecoverPasswordValues): Promise<void> {
    await this.authRepository.recoverPassword(values)
  }

  async resetPassword(values: ResetPasswordValues): Promise<void> {
    await this.authRepository.resetPassword(values)
  }

  async getUserById(id: string): Promise<PublicUser> {
    return this.authRepository.getUserById(id)
  }
}