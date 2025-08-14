import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components"

interface PurchaseConfirmationTemplateProps {
  customerName: string
  customerEmail: string
  productName: string
  productImage?: string
  price: string
  orderId: string
  purchaseDate: string
  accessUrl?: string
}

export const PurchaseConfirmationTemplate = ({
  customerName,
  customerEmail,
  productName,
  productImage,
  price,
  orderId,
  purchaseDate,
  accessUrl,
}: PurchaseConfirmationTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        ¡Compra confirmada! Ya puedes ver los detalles de tu pedido - Tu Tienda
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://edumine.com.ar/logo.svg"
              width="150"
              height="50"
              alt="Tienda"
              style={logo}
            />
          </Section>

          {/* Success Message */}
          <Section style={successSection}>
            <div style={successIcon}>✅</div>
            <Heading style={h1}>¡Compra Exitosa!</Heading>
            <Text style={successText}>
              Hola {customerName}, tu compra se realizó correctamente.
              <br />
              ¡Gracias por elegirnos!
            </Text>
          </Section>

          {/* Product Details */}
          <Section style={courseCard}>
            <Heading style={h2}>Detalles del Producto</Heading>

            <Section style={courseContent}>
              {productImage && (
                <div style={courseImageContainer}>
                  <Img
                    src={productImage}
                    width="120"
                    height="80"
                    alt={productName}
                    style={courseImageStyle}
                  />
                </div>
              )}

              <div style={courseInfo}>
                <Heading style={courseTitle}>{productName}</Heading>
                <Section style={courseDetails}>
                  <Text style={detailItem}>
                    <strong>Precio:</strong> {price}
                  </Text>
                </Section>
              </div>
            </Section>

            {/* Access Button (opcional, si aplica) */}
            {accessUrl && (
              <Section style={ctaSection}>
                <Link href={accessUrl} style={accessButton}>
                  Ver mi pedido
                </Link>
              </Section>
            )}
          </Section>

          {/* Purchase Summary */}
          <Section style={summaryCard}>
            <Heading style={h2}>Resumen de Compra</Heading>

            <Section style={summaryRow}>
              <Text style={summaryLabel}>Número de Orden:</Text>
              <Text style={summaryValue}>#{orderId}</Text>
            </Section>

            <Section style={summaryRow}>
              <Text style={summaryLabel}>Fecha de Compra:</Text>
              <Text style={summaryValue}>{purchaseDate}</Text>
            </Section>

            <Section style={summaryRow}>
              <Text style={summaryLabel}>Email de Cuenta:</Text>
              <Text style={summaryValue}>{customerEmail}</Text>
            </Section>

            <Hr style={summaryDivider} />

            <Section style={summaryRow}>
              <Text style={summaryLabelTotal}>Total Pagado:</Text>
              <Text style={summaryValueTotal}>{price}</Text>
            </Section>
          </Section>

          {/* Next Steps */}
          <Section style={stepsCard}>
            <Heading style={h2}>¿Qué sigue ahora?</Heading>

            <Section style={stepItem}>
              <Text style={stepNumber}>1</Text>
              <div style={stepContent}>
                <Text style={stepTitle}>Revisa tu pedido</Text>
                <Text style={stepDescription}>
                  Puedes ver los detalles de tu compra en tu cuenta o haciendo clic en el botón &quot;Ver mi pedido&quot;.
                </Text>
              </div>
            </Section>

            <Section style={stepItem}>
              <Text style={stepNumber}>2</Text>
              <div style={stepContent}>
                <Text style={stepTitle}>Recibe tu producto</Text>
                <Text style={stepDescription}>
                  Te notificaremos cuando tu pedido esté listo para ser enviado o retirado.
                </Text>
              </div>
            </Section>

            <Section style={stepItem}>
              <Text style={stepNumber}>3</Text>
              <div style={stepContent}>
                <Text style={stepTitle}>Soporte</Text>
                <Text style={stepDescription}>
                  Si tienes dudas o necesitas ayuda, nuestro equipo está disponible para asistirte.
                </Text>
              </div>
            </Section>
          </Section>

          {/* Support Section */}
          <Section style={supportCard}>
            <Heading style={h2}>¿Necesitas ayuda?</Heading>
            <Text style={text}>
              Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta sobre tu compra.
            </Text>

            <Section style={supportOptions}>
              <Text style={supportItem}>
                📧 Email:{" "}
                <Link href="mailto:soporte@tu-tienda.com" style={link}>
                  soporte@tu-tienda.com
                </Link>
              </Text>
              <Text style={supportItem}>
                💬 Chat en vivo: Disponible en nuestra plataforma
              </Text>
              <Text style={supportItem}>
                📚 Centro de ayuda:{" "}
                <Link href="https://tu-tienda.com/help" style={link}>
                  tu-tienda.com/help
                </Link>
              </Text>
            </Section>
          </Section>

          {/* Additional Resources */}
          <Section style={resourcesCard}>
            <Heading style={h2}>Recursos Adicionales</Heading>
            <Text style={text}>
              Aprovecha al máximo tu experiencia de compra:
            </Text>

            <Text style={resourceList}>
              •{" "}
              <Link href="https://tu-tienda.com/products" style={link}>
                Explora otros productos
              </Link>{" "}
              que pueden interesarte
              <br />• Síguenos en redes sociales para novedades y ofertas
              <br />•{" "}
              <Link href="https://tu-tienda.com/company" style={link}>
                Conoce más sobre nosotros
              </Link>
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Gracias por confiar en nuestra tienda.
            </Text>
            <Text style={footerText}>
              © 2024 Tu Tienda. Todos los derechos reservados.
            </Text>
            <Text style={footerText}>
              Si tienes problemas para acceder,{" "}
              <Link href="mailto:soporte@tu-tienda.com" style={unsubscribeLink}>
                contáctanos aquí
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  width: "100%",
  maxWidth: "600px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
}

const header = {
  padding: "20px",
  backgroundColor: "#001c33",
  borderRadius: "8px 8px 0 0",
}

const logo = {
  margin: "0 auto",
  display: "block",
}

const successSection = {
  padding: "30px 20px 20px",
  textAlign: "center" as const,
  backgroundColor: "#f0f9ff",
}

const successIcon = {
  fontSize: "48px",
  marginBottom: "16px",
}

const h1 = {
  color: "#001c33",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 16px",
  textAlign: "center" as const,
}

const h2 = {
  color: "#001c33",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
}

const successText = {
  color: "#1a1a1a",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
}

const courseCard = {
  backgroundColor: "#ffffff",
  border: "2px solid #e67e22",
  borderRadius: "12px",
  padding: "20px",
  margin: "20px",
}

const courseContent = {
  display: "block",
  marginBottom: "20px",
}

const courseImageContainer = {
  marginBottom: "15px",
  textAlign: "center" as const,
}

const courseImageStyle = {
  borderRadius: "8px",
  objectFit: "cover" as const,
  maxWidth: "100%",
}

const courseInfo = {
  width: "100%",
}

const courseTitle = {
  color: "#001c33",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
}

const courseDetails = {
  margin: "0",
}

const detailItem = {
  color: "#5c5c5c",
  fontSize: "14px",
  margin: "4px 0",
  wordBreak: "break-word" as const,
}

const ctaSection = {
  textAlign: "center" as const,
  marginTop: "24px",
}

const accessButton = {
  backgroundColor: "#e67e22",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 24px",
  borderRadius: "8px",
  display: "inline-block",
}

const summaryCard = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 20px 20px",
}

const summaryRow = {
  display: "block",
  margin: "8px 0",
}

const summaryLabel = {
  color: "#5c5c5c",
  fontSize: "14px",
  margin: "0 0 4px 0",
  display: "block",
}

const summaryValue = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
  display: "block",
  wordBreak: "break-word" as const,
}

const summaryLabelTotal = {
  color: "#001c33",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px 0",
  display: "block",
}

const summaryValueTotal = {
  color: "#e67e22",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
  display: "block",
}

const summaryDivider = {
  borderColor: "#dee2e6",
  margin: "16px 0",
}

const stepsCard = {
  backgroundColor: "#fff8f0",
  border: "1px solid #e67e22",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 20px 20px",
}

const stepItem = {
  display: "table",
  width: "100%",
  margin: "0 0 20px",
}

const stepNumber = {
  backgroundColor: "#e67e22",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  borderRadius: "50%",
  width: "28px",
  height: "28px",
  display: "table-cell",
  textAlign: "center" as const,
  verticalAlign: "top" as const,
}

const stepContent = {
  display: "table-cell",
  paddingLeft: "15px",
  verticalAlign: "top" as const,
}

const stepTitle = {
  color: "#001c33",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px",
}

const stepDescription = {
  color: "#5c5c5c",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
}

const supportCard = {
  backgroundColor: "#e8f4fd",
  border: "1px solid #bee5eb",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 20px 20px",
}

const supportOptions = {
  margin: "16px 0 0",
}

const supportItem = {
  color: "#1a1a1a",
  fontSize: "14px",
  margin: "8px 0",
  wordBreak: "break-word" as const,
}

const resourcesCard = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 20px 20px",
}

const resourceList = {
  color: "#5c5c5c",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "12px 0 0",
  wordBreak: "break-word" as const,
}

const text = {
  color: "#5c5c5c",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
}

const link = {
  color: "#e67e22",
  textDecoration: "underline",
}

const hr = {
  borderColor: "#e9ecef",
  margin: "20px 0",
}

const footer = {
  padding: "0 20px",
  textAlign: "center" as const,
}

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "4px 0",
}

const unsubscribeLink = {
  color: "#8898aa",
  textDecoration: "underline",
}

export default PurchaseConfirmationTemplate