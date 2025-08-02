import { AppActionError } from "@/types/types"

export function isAppActionError(response: any): response is AppActionError {
  return response && typeof response === 'object' && 'error' in response
}