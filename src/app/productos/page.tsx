// src/app/productos/page.tsx
import { Suspense } from "react";
import ProductPageClient from "./product-page-client";

export default function Page() {
  return (
    <Suspense fallback={null /* podés poner un skeleton si querés */}>
      <ProductPageClient />
    </Suspense>
  );
}
