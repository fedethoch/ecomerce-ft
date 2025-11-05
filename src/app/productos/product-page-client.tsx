// src/app/productos/product-page-client.tsx
"use client";

import { useEffect, useState } from "react";
// --- (MODIFICACIÓN 1) ---
// Importamos los hooks correctos de Next.js para leer y escribir en la URL
import { useSearchParams, useRouter, usePathname } from "next/navigation";
// --- (FIN MODIFICACIÓN 1) ---
import { ProductFilters } from "@/components/products/product-filters";
import { ProductList } from "@/components/products/product-list";
import { ProductPagination } from "@/components/products/product-pagination";
import { getProducts } from "@/controllers/products-controller";
import type { ProductType } from "@/types/products/products";
import { actionErrorHandler } from "@/lib/handlers/actionErrorHandler";
import { AppActionException } from "@/types/exceptions";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductPageClient() {
  const [products, setProducts] = useState<ProductType[]>([]); // La lista "master" de todos los productos
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]); // Los productos que se muestran
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialFilters, setInitialFilters] = useState<any | null>(null); // Para sincronizar la UI de ProductFilters

  // --- (MODIFICACIÓN 2) ---
  // Usamos los hooks de Next.js
  const searchParams = useSearchParams(); // Para LEER la URL
  const router = useRouter(); // Para ESCRIBIR en la URL
  const pathname = usePathname(); // Para obtener la ruta actual (ej: /productos)
  // --- (FIN MODIFICACIÓN 2) ---

  const productsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const DEFAULT_FILTERS = {
    category: "all",
    priceRange: [0, 100000],
    sizes: [] as string[],
    search: "",
    isNew: false,
    isSale: false,
  };

  // --- (MODIFICACIÓN 3) ---
  // EFECTO 1: Cargar la lista "master" de productos UNA SOLA VEZ
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await actionErrorHandler(getProducts);
        if (!Array.isArray(data))
          throw new Error("La respuesta no es un array de productos");
        setProducts(data);
        // NO filtramos aquí
        // NO seteamos isLoading(false) aquí. El Efecto 2 lo hará.
      } catch (e) {
        setError(
          e instanceof AppActionException ? e.message : "Error desconocido"
        );
        setIsLoading(false); // Detenemos la carga solo si hay un error
      }
    };

    fetchProducts();
  }, []); // Array vacío: se ejecuta solo una vez al montar
  // --- (FIN MODIFICACIÓN 3) ---

  // --- (Helper functions: las movemos aquí para que el Efecto 2 las pueda usar) ---
  const normalize = (s: unknown) =>
    String(s ?? "")
      .toLowerCase()
      .trim();
  const normalizeSize = (s: unknown) => String(s ?? "").trim().toUpperCase();
  const getProductSizes = (p: any): string[] => {
    const v = p?.sizes;
    if (Array.isArray(v)) return v.map(normalizeSize);
    if (typeof v === "string") {
      const t = v.trim();
      if (t.startsWith("[") && t.endsWith("]")) {
        try {
          const arr = JSON.parse(t);
          if (Array.isArray(arr)) return arr.map(normalizeSize);
        } catch {}
      }
      return t.split(/[,\s]+/).filter(Boolean).map(normalizeSize);
    }
    return [];
  };
  const categoryMatches = (
    selected: string | undefined | null,
    prodCat: unknown
  ) => {
    const sel = normalize(selected);
    const prod = normalize(prodCat);
    if (!sel || sel === "all") return true;
    const variants: Record<string, string[]> = {
      hombre: ["hombre", "hombres", "man", "men", "masculino", "varon"],
      mujer: ["mujer", "mujeres", "woman", "women", "femenino"],
      accesorios: ["accesorio", "accesorios", "accessories"],
      camisetas: ["camiseta", "camisetas", "tshirt", "tee", "polera", "remera"],
      pantalones: ["pantalon", "pantalones", "pants", "trousers", "jeans"],
      vestidos: ["vestido", "vestidos", "dress", "dresses"],
      chaquetas: ["chaqueta", "chaquetas", "jacket", "jackets", "abrigo"],
      calzado: ["calzado", "zapato", "zapatos", "shoes", "footwear"],
    };
    const allowed = variants[sel] ?? [sel];
    return allowed.includes(prod);
  };
  // --- (Fin Helper functions) ---

  // --- (MODIFICACIÓN 4) ---
  // EFECTO 2: Reaccionar a cambios en la URL (searchParams) o cuando la lista master (products) carga
  useEffect(() => {
    // Si la lista master no está lista, no hacemos nada
    if (products.length === 0) {
      // A menos que ya haya terminado de cargar (con error o 0 productos)
      if (!isLoading) {
        setFilteredProducts([]);
        setInitialFilters(DEFAULT_FILTERS);
      }
      return;
    }

    // 1. Leer los filtros desde la URL (searchParams)
    const params = new URLSearchParams(searchParams.toString());
    const category = params.get("category") || undefined;
    const typeParam = params.get("type") || undefined;
    const priceMin = params.get("priceMin");
    const priceMax = params.get("priceMax");
    const sizes = params.get("sizes");
    const search = params.get("search") || undefined;
    const isNew = params.get("isNew");
    const isSale = params.get("isSale");

    const parsedPriceRange =
      priceMin || priceMax
        ? [Number(priceMin) || 0, Number(priceMax) || 100000]
        : undefined;
    const parsedSizes = sizes ? sizes.split(",") : undefined;

    const typeToFilterCategory: Record<string, string> = {
      remeras: "camisetas",
      camisetas: "camisetas",
      pantalon: "pantalones",
      pantalones: "pantalones",
      buzos: "chaquetas",
      camperas: "chaquetas",
      chaquetas: "chaquetas",
      calzado: "calzado",
      gorras: "accesorios",
      accesorios: "accesorios",
      relojes: "accesorios",
      carteras: "accesorios",
    };
    const mappedCategoryFromType = typeParam
      ? typeToFilterCategory[typeParam.toLowerCase().trim()] ??
        typeParam.toLowerCase().trim()
      : undefined;

    // Objeto de filtros para la UI de ProductFilters
    const parsedInitialFilters = {
      ...(mappedCategoryFromType ? { category: mappedCategoryFromType } : {}),
      ...(category && !mappedCategoryFromType
        ? { category: String(category).toLowerCase().trim() }
        : {}),
      ...(parsedPriceRange ? { priceRange: parsedPriceRange } : {}),
      ...(parsedSizes ? { sizes: parsedSizes } : {}),
      ...(search ? { search } : {}),
      ...(isNew ? { isNew: isNew === "1" || isNew === "true" } : {}),
      ...(isSale ? { isSale: isSale === "1" || isSale === "true" } : {}),
    };
    setInitialFilters(parsedInitialFilters); // Sincroniza la UI de filtros

    // Objeto completo para filtrar
    const filtersToApply = { ...DEFAULT_FILTERS, ...parsedInitialFilters };

    // 2. Aplicar filtros a la lista "master"
    let filtered = [...products];
    if (filtersToApply.search) {
      const searchLower = filtersToApply.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }
    if (filtersToApply.category && filtersToApply.category !== "all") {
      filtered = filtered.filter((p) =>
        categoryMatches(filtersToApply.category, p.category)
      );
    }
    if (filtersToApply.priceRange?.length === 2) {
      const [min, max] = filtersToApply.priceRange;
      filtered = filtered.filter((p) => p.price >= min && p.price <= max);
    }
    if (filtersToApply.sizes?.length) {
      const selected = new Set(
        filtersToApply.sizes.map((s: string) => normalizeSize(s))
      );
      filtered = filtered.filter((p) =>
        getProductSizes(p).some((s) => selected.has(s))
      );
    }
    if (filtersToApply.isNew) filtered = filtered.filter((p) => !!p.isNew);
    if (filtersToApply.isSale) filtered = filtered.filter((p) => !!p.isSale);

    // 3. Actualizar el estado
    setFilteredProducts(filtered);
    setCurrentPage(1); // Resetea la paginación
    setIsLoading(false); // ¡Terminamos de cargar y filtrar! Oculta el skeleton.
  }, [searchParams, products, isLoading]); // Dependencias: la URL y la lista master
  // --- (FIN MODIFICACIÓN 4) ---

  // --- (MODIFICACIÓN 5) ---
  // Esta función AHORA SÓLO ACTUALIZA LA URL.
  // El Efecto 2 se encargará de filtrar.
  const handleFilterChange = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category && filters.category !== "all")
      params.set("category", filters.category);
    if (filters.priceRange) {
      params.set("priceMin", String(filters.priceRange[0]));
      params.set("priceMax", String(filters.priceRange[1]));
    }
    if (filters.sizes && filters.sizes.length > 0)
      params.set("sizes", filters.sizes.join(","));
    if (filters.isNew) params.set("isNew", "1");
    if (filters.isSale) params.set("isSale", "1");

    // Usamos router.push para navegar a la nueva URL
    // Esto será detectado por el hook useSearchParams y disparará el Efecto 2
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  // --- (FIN MODIFICACIÓN 5) ---

  // Scroll to top (esto está bien)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        window.scrollTo(0, 0);
      }
    }
  }, [currentPage]);

  // --- Skeletons y manejo de errores (sin cambios) ---
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

  // --- Renderizado (con una modificación en "Restablecer filtros") ---
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
              {/* --- (MODIFICACIÓN 6) --- */}
              <button
                onClick={() => {
                  // Navegamos a la URL base sin filtros
                  router.push(pathname, { scroll: false });
                }}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              >
                Restablecer filtros
              </button>
              {/* --- (FIN MODIFICACIÓN 6) --- */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}