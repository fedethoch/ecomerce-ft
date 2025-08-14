"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/hooks/use-products"
import { useRef } from "react"
import type { ProductType } from "@/types/products/products"
import { uploadProductImages } from "@/controllers/storage-controller"; // Asegúrate de importar esto

interface EditProductViewProps {
  productId: string
  setActiveView: (view: string, productId?: string) => void
}

export function EditProductView({ productId, setActiveView }: EditProductViewProps) {
  const { editProduct, getProduct } = useProducts()
  const [Loading, setLoading] = useState(true)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [mainImageIndex, setMainImageIndex] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<Omit<ProductType, "id">>({
    name: "",
    price: 0,
    originalPrice: 0,
    quantity: 0,
    category: "",
    isNew: false,
    isSale: false,
    sizes: [],
    imagePaths: [],
    description: "",
  })
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones
    if (imageFiles.length === 0 && formData.imagePaths.length === 0) {
      alert("Por favor selecciona al menos una imagen");
      setLoading(false);
      return;
    }
    if (formData.description.length < 10) {
      alert("Descripcion minimo 10 caracteres");
      setLoading(false);
      return;
    }

    try {
      // 1. Subir imágenes nuevas si hay
      let newImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        // Ordenar: principal primero
        const orderedFiles = [
          ...imageFiles.slice(mainImageIndex - formData.imagePaths.length, mainImageIndex - formData.imagePaths.length + 1),
          ...imageFiles.filter((_, idx) => (formData.imagePaths.length + idx) !== mainImageIndex)
        ];
        const filesToUpload = mainImageIndex < formData.imagePaths.length ? imageFiles : orderedFiles;
        const uploadResult = await uploadProductImages(filesToUpload, productId);

        // Manejo de error
        if (typeof uploadResult === "object" && "statusCode" in uploadResult) {
          alert(uploadResult.userMessage || uploadResult.message || "Error al subir imágenes");
          setLoading(false);
          return;
        }

        newImageUrls = uploadResult;
      }

      // 2. Combinar imágenes existentes y nuevas (principal primero)
      let allImagePaths: string[] = [];
      if (mainImageIndex < formData.imagePaths.length) {
        // Principal es una imagen existente
        allImagePaths = [
          formData.imagePaths[mainImageIndex],
          ...formData.imagePaths.filter((_, idx) => idx !== mainImageIndex),
          ...newImageUrls
        ];
      } else {
        // Principal es una imagen nueva
        allImagePaths = [
          ...formData.imagePaths,
          ...newImageUrls
        ];
        // Mover la imagen principal nueva al inicio de las nuevas
        const mainNewIdx = mainImageIndex - formData.imagePaths.length;
        if (mainNewIdx > 0 && newImageUrls.length > 0) {
          const [main, ...rest] = newImageUrls;
          allImagePaths = [
            ...formData.imagePaths,
            main,
            ...rest
          ];
        }
      }

      // 3. Preparar datos para actualizar
      const productData = {
        name: formData.name ?? "",
        price: formData.price ?? 0,
        original_price: formData.originalPrice ?? 0,
        quantity: formData.quantity ?? 0,
        category: formData.category ?? "",
        is_new: formData.isNew ?? false,
        is_sale: formData.isSale ?? false,
        sizes: formData.sizes ?? [],
        image_paths: allImagePaths,
        description: formData.description ?? ""
      };

      // 4. Llamar a la función de edición
      const result = await editProduct(productId, productData);
      console.log("Resultado de editProduct:", result);

      if (result) {
        setActiveView("products");
      } else {
        alert("No se pudo actualizar el producto");
      }
    } catch (error: any) {
      console.error("Error detallado al actualizar producto:", error);
      alert(`Error al actualizar producto: ${error.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  }
  // Cargar el producto cuando el componente se monte
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const productData: any = await getProduct(productId)
        if (productData) {
          setFormData({
            name: productData.name ?? "",
            price: productData.price ?? 0,
            originalPrice: productData.original_price ?? 0,
            quantity: productData.quantity ?? 0,
            category: productData.category ?? "",
            isNew: productData.is_new ?? false,
            isSale: productData.is_sale ?? false,
            sizes: productData.sizes ?? [],
            imagePaths: productData.image_paths ?? [],
            description: productData.description ?? "",
          })
        }
      } catch (err) {
        console.error("Error al cargar el producto:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])



  const toggleSize = (size: string) => {
    setFormData(prev => {
      const sizes = prev.sizes ?? [];
      return {
        ...prev,
        sizes: sizes.includes(size)
          ? sizes.filter(s => s !== size)
          : [...sizes, size]
      };
    });
  };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files))
      setMainImageIndex(0) // reset principal al agregar nuevas imágenes
    }
  }


  const handleRemoveImage = (idx: number) => {
    setImageFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== idx)
      // Si eliminamos la principal, la nueva principal será la 0
      if (idx === mainImageIndex) {
        setMainImageIndex(0)
      } else if (idx < mainImageIndex) {
        setMainImageIndex(mainImageIndex - 1)
      }
      return newFiles
    })
  }


  if (Loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
            <p className="text-muted-foreground">Modifica los detalles de tu producto</p>
          </div>
          <Button variant="outline" onClick={() => setActiveView("products")}>
            Volver a Productos
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Cargando producto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
          <p className="text-muted-foreground">Añade un nuevo producto a tu inventario</p>
        </div>
        <Button variant="outline" onClick={() => setActiveView("products")}>
          Volver a Productos
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Detalles principales del producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  placeholder="Ej: Camiseta Básica Blanca"
                  value={formData.name ?? ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price === 0 ? "" : formData.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        price: value === "" ? 0 : Number.parseFloat(value)
                      }))
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Precio Original (opcional)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.originalPrice === 0 ? "" : formData.originalPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        originalPrice: value === "" ? 0 : Number.parseFloat(value)
                      }))
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Stock</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={formData.quantity === 0 ? "" : formData.quantity} // Muestra vacío cuando es 0
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      quantity: value === "" ? 0 : Number.parseInt(value)
                    }))
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Descripción del producto"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  minLength={10}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category ?? ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="camisetas">Camisetas</SelectItem>
                    <SelectItem value="pantalones">Pantalones</SelectItem>
                    <SelectItem value="vestidos">Vestidos</SelectItem>
                    <SelectItem value="chaquetas">Chaquetas</SelectItem>
                    <SelectItem value="calzado">Calzado</SelectItem>
                    <SelectItem value="accesorios">Accesorios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_new"
                    checked={formData.isNew}
                    onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                  />
                  <Label htmlFor="is_new">Producto Nuevo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_sale"
                    checked={formData.isSale}
                    onChange={(e) => setFormData(prev => ({ ...prev, isSale: e.target.checked }))}
                  />
                  <Label htmlFor="is_sale">En Oferta</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
              <CardDescription>Configura tallas y otros detalles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sizes">Tallas Disponibles</Label>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant={(formData.sizes ?? []).includes(size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Imágenes</Label>
                <div className="flex items-start gap-3 flex-wrap flex-col">
                  {/* Todas las imágenes (previas y nuevas) en una sola línea */}
                  <div className="flex gap-4 flex-wrap mb-2">
                    {/* Imágenes previas (URLs) */}
                    {formData.imagePaths.map((url, idx) => (
                      <div
                        key={`prev-${url}`}
                        className="relative group flex flex-col items-center"
                        style={{ width: 90 }}
                      >
                        <div
                          className={`rounded-lg overflow-hidden border transition-all duration-300
                            ${idx === mainImageIndex
                              ? "ring-2 ring-blue-500 scale-105 shadow-lg"
                              : "hover:ring-2 hover:ring-blue-300"}
                          `}
                          style={{ width: 80, height: 80, cursor: "pointer" }}
                          onClick={() => setMainImageIndex(idx)}
                        >
                          <img
                            src={url}
                            alt={`Imagen ${idx + 1}`}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                          />
                          {idx === mainImageIndex && (
                            <span className="absolute top-1 left-1 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-xs px-2 py-0.5 rounded shadow font-semibold z-10">
                              Principal
                            </span>
                          )}
                        </div>
                        <span className="text-xs max-w-[80px] truncate mt-2 text-center">{`Imagen ${idx + 1}`}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              imagePaths: prev.imagePaths.filter((_, i) => i !== idx)
                            }));
                            if (idx === mainImageIndex) setMainImageIndex(0);
                            else if (idx < mainImageIndex) setMainImageIndex(mainImageIndex - 1);
                          }}
                          className="mt-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors duration-200"
                          title="Eliminar imagen"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {/* Imágenes nuevas (Files) */}
                    {imageFiles.map((file, idx) => {
                      // El índice real en la lista combinada es después de las previas
                      const realIdx = formData.imagePaths.length + idx;
                      return (
                        <div
                          key={`new-${file.name}-${idx}`}
                          className="relative group flex flex-col items-center"
                          style={{ width: 90 }}
                        >
                          <div
                            className={`rounded-lg overflow-hidden border transition-all duration-300
                              ${realIdx === mainImageIndex
                                ? "ring-2 ring-blue-500 scale-105 shadow-lg"
                                : "hover:ring-2 hover:ring-blue-300"}
                          `}
                          style={{ width: 80, height: 80, cursor: "pointer" }}
                          onClick={() => setMainImageIndex(realIdx)}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                          />
                          {realIdx === mainImageIndex && (
                            <span className="absolute top-1 left-1 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-xs px-2 py-0.5 rounded shadow font-semibold z-10">
                              Principal
                            </span>
                          )}
                        </div>
                        <span className="text-xs max-w-[80px] truncate mt-2 text-center">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="mt-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors duration-200"
                          title="Eliminar imagen"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      );
                    })}
                  </div>
                  {/* Botón para seleccionar imágenes */}
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Seleccionar Imágenes
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Imágenes del Producto<br />
                    Formatos: JPG, PNG, WEBP. Máx. 5MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={() => setActiveView("products")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={Loading}>
            {Loading ? "Editando" : "Editar Producto"}
          </Button>
        </div>
      </form>
    </div>
  )
}