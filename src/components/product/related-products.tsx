import { ProductCard } from "@/components/ui/product-card"
import { mockProducts } from "@/lib/mock-data"

interface RelatedProductsProps {
  currentProduct: {
    id: string
    category: string
  }
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  // Get related products from the same category, excluding current product
  const relatedProducts = mockProducts
    .filter((product) => product.category === currentProduct.category && product.id !== currentProduct.id)
    .slice(0, 4)

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="mt-16 pt-8 border-t">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Productos Relacionados</h2>
        <p className="text-muted-foreground">Otros productos que podrían interesarte</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
