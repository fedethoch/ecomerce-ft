export interface PublicUser {
  id: string
  email: string
  name: string
  phone: string
  type_role: "user" | "admin"
  created_at?: string
}

export type AppActionError = {
  statusCode: number
  message: string
  userMessage?: string
  fieldErrors?: Record<string, string[]>
  details?: unknown
}
