import { ProductGallery } from "@/components/product/product-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { ProductTabs } from "@/components/product/product-tabs"
import { RelatedProducts } from "@/components/product/related-products"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { mockProducts } from "@/lib/mock-data"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = mockProducts.find((p) => p.id === params.id)

  if (!product) {
    notFound()
  }

  // Mock additional product data
  const productDetails = {
    ...product,
    images: [
      product.image,
      "/placeholder.svg?height=600&width=600&text=Vista+2",
      "/placeholder.svg?height=600&width=600&text=Vista+3",
      "/placeholder.svg?height=600&width=600&text=Vista+4",
    ],
    features: [
      "Material de alta calidad",
      "Diseño moderno y versátil",
      "Cómodo para uso diario",
      "Fácil cuidado y mantenimiento",
    ],
    specifications: {
      Material: "100% Algodón",
      Cuidado: "Lavado a máquina 30°C",
      Origen: "Fabricado en Argentina",
      Garantía: "30 días de garantía",
    },
    reviews: [
      {
        id: "1",
        user: "María García",
        rating: 5,
        comment: "Excelente calidad, muy cómodo y el talle es perfecto.",
        date: "2024-01-15",
      },
      {
        id: "2",
        user: "Juan Pérez",
        rating: 4,
        comment: "Buen producto, llegó rápido y en perfectas condiciones.",
        date: "2024-01-10",
      },
      {
        id: "3",
        user: "Ana López",
        rating: 5,
        comment: "Me encanta! La tela es muy suave y el diseño es hermoso.",
        date: "2024-01-08",
      },
    ],
  }

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: product.category, href: `/productos?category=${product.category}` },
    { label: product.name, href: `/productos/${product.id}` },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <BreadcrumbItem key={item.href}>
                {/* Si es el último, lo mostramos como página actual */}
                {index === breadcrumbItems.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}

                {/* Separador, solo si no es el último */}
                {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Gallery */}
          <div className="lg:sticky lg:top-4">
            <ProductGallery images={productDetails.images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div>
            <ProductInfo product={productDetails} />
          </div>
        </div>

        {/* Product Details Tabs */}
        <ProductTabs product={productDetails} />

        {/* Related Products */}
        <RelatedProducts currentProduct={product} />
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    id: product.id,
  }))
}
