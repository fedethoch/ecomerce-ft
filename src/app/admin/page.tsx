import { AdminStats } from "@/components/admin/admin-stats"
import { RecentOrders } from "@/components/admin/recent-orders"
import { SalesChart } from "@/components/admin/sales-chart"

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <AdminStats />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <SalesChart />
          </div>
          <div className="lg:w-1/3">
            <RecentOrders />
          </div>
        </div>
      </div>
    </div>
  )
}
