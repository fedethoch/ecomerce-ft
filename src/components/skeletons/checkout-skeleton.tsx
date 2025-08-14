
import { Card, CardContent } from "@/components/ui/card"

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded-md w-56 mx-auto animate-pulse"></div>
        </div>

        {/* Course Summary Card Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-6">
              {/* Course Image Skeleton - Larger */}
              <div className="w-48 h-36 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse"></div>

              {/* Course Info Skeleton */}
              <div className="flex-1 space-y-3">
                {/* Course Title Skeleton */}
                <div className="h-6 bg-gray-200 rounded-md w-full animate-pulse"></div>

                {/* Course Details Skeleton */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-28 animate-pulse"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-36 animate-pulse"></div>
                  </div>
                </div>

                {/* Price Section Skeleton */}
                <div className="flex items-center justify-between pt-2">
                  <div className="h-4 bg-gray-200 rounded-md w-12 animate-pulse"></div>
                  <div className="text-right space-y-1">
                    <div className="h-6 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Section Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse"></div>

          {/* Payment Options Skeleton */}
          <div className="flex gap-4">
            {/* Mercado Pago Option Skeleton */}
            <div className="flex-1 p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* PayPal Option Skeleton */}
            <div className="flex-1 p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions Skeleton */}
        <div className="flex items-start space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded border animate-pulse mt-0.5"></div>
          <div className="space-y-1 flex-1">
            <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Continue Button Skeleton */}
        <div className="h-12 bg-gray-200 rounded-md w-full animate-pulse"></div>

        {/* Security Notice Skeleton */}
        <div className="text-center">
          <div className="h-4 bg-gray-200 rounded-md w-40 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
