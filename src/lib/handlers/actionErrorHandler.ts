import { AppActionException } from "@/types/exceptions"
import { AppActionError } from "@/types/types"
import { z } from "zod"

const errorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  userMessage: z.string().optional(),
  fieldErrors: z.record(z.array(z.string())).optional(),
});

export async function actionErrorHandler<T>(
  fn: () => Promise<T | AppActionError>
): Promise<T> {
  try {
    const result = await fn();
    
    // Verificar si es un objeto de error válido
    if (result && typeof result === 'object' && 'statusCode' in result) {
      const parsedResult = errorSchema.safeParse(result);
      
      if (parsedResult.success) {
        const { message, statusCode, userMessage, fieldErrors } = parsedResult.data;
        throw new AppActionException(
          statusCode,
          message,
          userMessage,
          fieldErrors
        );
      }
    }
    
    return result as T;
  } catch (error: any) {
    // Manejar errores inesperados
    if (error instanceof AppActionException) {
      throw error;
    }
    
    console.error("Unexpected error in actionErrorHandler:", error);
    throw new AppActionException(
      500,
      error.message || "Internal server error",
      "Ocurrió un error inesperado"
    );
  }
}