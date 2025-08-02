export function getOrderStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "completado":
      return "default"
    case "procesando":
      return "secondary"
    case "enviado":
      return "outline"
    default:
      return "destructive"
  }
}