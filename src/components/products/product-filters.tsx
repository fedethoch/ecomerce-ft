"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import is from "zod/v4/locales/is.cjs";

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: {
    category?: string;
    priceRange?: number[];
    sizes?: string[];
    search?: string;
    isNew?: boolean;
    isSale?: boolean;
  };
}

export function ProductFilters({
  onFilterChange,
  initialFilters,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: [0, 100000],
    sizes: [] as string[],
    search: "",
    isNew: false,
    isSale: false,
  });

  const [searchInput, setSearchInput] = useState("");

  const categories = [
    { id: "all", label: "Todas las categorías" },
    { id: "camisetas", label: "Camisetas" },
    { id: "pantalones", label: "Pantalones" },
    { id: "vestidos", label: "Vestidos" },
    { id: "chaquetas", label: "Chaquetas" },
    { id: "calzado", label: "Calzado" },
    { id: "accesorios", label: "Accesorios" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...filters.sizes, size]
      : filters.sizes.filter((s) => s !== size);
    const newFilters = { ...filters, sizes: newSizes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    // Don't update filters immediately - let the debounced effect handle it
  };

  const handleIsNewChange = (checked: boolean) => {
    const newFilters = { ...filters, isNew: Boolean(checked) };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleIsSaleChange = (checked: boolean) => {
    const newFilters = { ...filters, isSale: Boolean(checked) };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Handle local search input changes with debounce
  useEffect(() => {
    // Skip the effect if the change came from initialFilters
    if (searchInput === (initialFilters?.search ?? "")) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const newFilters = { ...filters, search: searchInput };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters, onFilterChange, initialFilters?.search]);

  const clearFilters = () => {
    const newFilters = {
      category: "all",
      priceRange: [0, 100000],
      sizes: [],
      search: "",
      isNew: false,
      isSale: false,
    };
    setFilters(newFilters);
    setSearchInput("");
    onFilterChange(newFilters);
  };

  // Handle initial filters from URL
  useEffect(() => {
    if (initialFilters) {
      const newFilters = {
        category: initialFilters.category ?? "all",
        priceRange: initialFilters.priceRange ?? [0, 100000],
        sizes: initialFilters.sizes ?? [],
        search: initialFilters.search ?? "",
        isNew: Boolean(initialFilters.isNew),
        isSale: Boolean(initialFilters.isSale),
      };

      setFilters(newFilters);
      setSearchInput(initialFilters.search ?? "");
      onFilterChange(newFilters);
    }
  }, [initialFilters]);

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filtros</CardTitle>
        <Button variant="ghost" size="sm" onClick={clearFilters} type="button">
          Limpiar
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <h3 className="font-medium mb-3">Buscar</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Separator />

                {/* NUEVO: Estado */}
        <div>
          <h3 className="font-medium mb-3">Estado</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNew"
                checked={filters.isNew}
                onCheckedChange={(checked) => handleIsNewChange(checked as boolean)}
                type="button"
              />
              <Label htmlFor="isNew" className="text-sm">
                Novedades
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSale"
                checked={filters.isSale}
                onCheckedChange={(checked) => handleIsSaleChange(checked as boolean)}
                type="button"
              />
              <Label htmlFor="isSale" className="text-sm">
                En oferta
              </Label>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-medium mb-3">Categoría</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={filters.category === category.id}
                  onCheckedChange={() => handleCategoryChange(category.id)}
                  type="button"
                />
                <Label htmlFor={category.id} className="text-sm">
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <h3 className="font-medium mb-3">Rango de Precio</h3>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              max={100000}
              min={0}
              step={1000}
              className="mb-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${filters.priceRange[0].toLocaleString()}</span>
              <span>${filters.priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sizes */}
        <div>
          <h3 className="font-medium mb-3">Tallas</h3>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={size}
                  checked={filters.sizes.includes(size)}
                  onCheckedChange={(checked) =>
                    handleSizeChange(size, checked as boolean)
                  }
                  type="button"
                />
                <Label htmlFor={size} className="text-sm">
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
