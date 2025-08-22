"use client";

import { useEffect, useState } from "react";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductList } from "@/components/products/product-list";
import { ProductPagination } from "@/components/products/product-pagination";
import { getProducts } from "@/controllers/products-controller";
import { ProductType } from "@/types/products/products";
import { actionErrorHandler } from "@/lib/handlers/actionErrorHandler";
import { AppActionException } from "@/types/exceptions";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialFilters, setInitialFilters] = useState<any | null>(null);

  const productsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  useEffect(() => {
    // Read URL search params to prepopulate filters
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || undefined;
    const priceMin = params.get("priceMin");
    const priceMax = params.get("priceMax");
    const sizes = params.get("sizes");
    const parsedPriceRange =
      priceMin || priceMax
        ? [Number(priceMin) || 0, Number(priceMax) || 100000]
        : undefined;
    const parsedSizes = sizes ? sizes.split(",") : undefined;
    const parsedInitialFilters = {
      ...(category ? { category: String(category).toLowerCase().trim() } : {}),
      ...(parsedPriceRange ? { priceRange: parsedPriceRange } : {}),
      ...(parsedSizes ? { sizes: parsedSizes } : {}),
    };
    setInitialFilters(parsedInitialFilters);

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await actionErrorHandler(getProducts);

        // Manejar respuesta exitosa
        if (Array.isArray(data)) {
          setProducts(data);
          // Apply initial filters if present (use parsedInitialFilters from outer scope)
          if (
            parsedInitialFilters &&
            Object.keys(parsedInitialFilters).length > 0
          ) {
            let filtered = [...data];
            if (
              parsedInitialFilters.category &&
              parsedInitialFilters.category !== "all"
            ) {
              filtered = filtered.filter((product) =>
                categoryMatches(parsedInitialFilters.category, product.category)
              );
            }
            if (
              parsedInitialFilters.priceRange &&
              parsedInitialFilters.priceRange.length === 2
            ) {
              const [min, max] = parsedInitialFilters.priceRange;
              filtered = filtered.filter(
                (product) => product.price >= min && product.price <= max
              );
            }
            if (
              parsedInitialFilters.sizes &&
              parsedInitialFilters.sizes.length > 0
            ) {
              const sizesArr = parsedInitialFilters.sizes;
              filtered = filtered.filter((product) =>
                product.sizes.some((size) => sizesArr.includes(size))
              );
            }
            setFilteredProducts(filtered);
          } else {
            setFilteredProducts(data);
          }
        } else {
          throw new Error("La respuesta no es un array de productos");
        }
      } catch (error) {
        console.error("Error fetching products:", error);

        if (error instanceof AppActionException) {
          setError(
            error.userMessage || "Ocurrió un error al cargar los productos"
          );
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Ocurrió un error desconocido al cargar los productos");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Helper: normalize and flexible category matching (includes new categories)
  const normalize = (s: unknown) => String(s ?? "").toLowerCase().trim();

  const categoryMatches = (selected: string | undefined | null, prodCat: unknown) => {
    const sel = normalize(selected);
    const prod = normalize(prodCat);
    if (!sel || sel === "all") return true;

    const variants: Record<string, string[]> = {
      hombre: ["hombre", "hombres", "man", "men", "masculino", "varon", "varones"],
      mujer: ["mujer", "mujeres", "woman", "women", "femenino"],
      accesorios: ["accesorio", "accesorios", "accessories"],
      camisetas: ["camiseta", "camisetas", "tshirt", "tee", "polera", "remera"],
      pantalones: ["pantalon", "pantalones", "pants", "trousers", "jeans"],
      vestidos: ["vestido", "vestidos", "dress", "dresses"],
      chaquetas: ["chaqueta", "chaquetas", "jacket", "jackets", "abrigo", "abrigos"],
      calzado: ["calzado", "zapato", "zapatos", "shoes", "footwear"],
    };

    const allowed = variants[sel] ?? [sel];
    return allowed.includes(prod);
  };

  const handleFilterChange = (filters: any) => {
    let filtered = [...products]; // Copia para no mutar el estado original

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((product) =>
        categoryMatches(filters.category, product.category)
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (product) =>
          product.price >= filters.priceRange[0] &&
          product.price <= filters.priceRange[1]
      );
    }

    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter((product) =>
        product.sizes.some((size) => filters.sizes.includes(size))
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
    // Sync filters to URL
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== "all")
        params.set("category", filters.category);
      if (filters.priceRange) {
        params.set("priceMin", String(filters.priceRange[0]));
        params.set("priceMax", String(filters.priceRange[1]));
      }
      if (filters.sizes && filters.sizes.length > 0)
        params.set("sizes", filters.sizes.join(","));
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    } catch (e) {
      console.warn("Could not update URL with filters", e);
    }
  };

  // Estado de carga
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Skeleton className="h-10 w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-3">Error al cargar productos</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4">
          <ProductFilters
            onFilterChange={handleFilterChange}
            initialFilters={initialFilters ?? undefined}
          />
        </aside>

        <div className="lg:w-3/4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Productos</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "producto" : "productos"}{" "}
              encontrados
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            <>
              <ProductList products={currentProducts} />

              {totalPages > 1 && (
                <ProductPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="text-xl font-semibold mb-3">
                No se encontraron productos
              </h2>
              <p className="text-muted-foreground mb-5 max-w-md">
                No hay productos que coincidan con los filtros seleccionados.
                Intenta ajustar los filtros o vuelve más tarde.
              </p>
              <button
                onClick={() => {
                  setFilteredProducts(products);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              >
                Restablecer filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
