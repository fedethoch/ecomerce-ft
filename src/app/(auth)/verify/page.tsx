import { Suspense } from 'react';
import VerifyOtpClient from './verify-otp-client';
import { Loader2 } from 'lucide-react';

// Fallback de carga simple para Suspense
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

// Esta es la página (Server Component)
export default function VerifyPage() {
  return (
    // Suspense es el límite que Vercel/Next.js te pidió
    <Suspense fallback={<LoadingFallback />}>
      <VerifyOtpClient />
    </Suspense>
  );
}