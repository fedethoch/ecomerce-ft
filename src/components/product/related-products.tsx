import { ProductCard } from "@/components/ui/product-card"
import { ProductType } from "@/types/products/products" // Asegúrate de tener definido el tipo Product
import { createClient } from "@supabase/supabase-js"


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

interface RelatedProductsProps {
  currentProductId: string
  category: string
}

export async function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  // Obtener productos relacionados desde Supabase
  const relatedProducts = await getRelatedProducts(category, currentProductId, 4)

  if (!relatedProducts || relatedProducts.length === 0) {
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

// Función para obtener productos relacionados desde Supabase
async function getRelatedProducts(category: string, excludeId: string, limit = 4) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey); // Importa tu cliente Supabase
    
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", excludeId)
      .limit(limit);

    if (error) {
      console.error("Error fetching related products:", error.message);
      return [];
    }

    return products;
  } catch (error) {
    console.error("Error in getRelatedProducts:", error);
    return [];
  }
}