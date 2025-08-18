"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "./app-sidebar"
import { DashboardView } from "./views/dashboard-view"
import { ProductsView } from "./views/products-view"
import { CreateProductView } from "./views/create-product"
import { EditProductView } from "./views/edit-product" // Nuevo componente
import { OrdersView } from "./views/orders-view"
import { CustomersView } from "./views/customer-view"
import { AnalyticsView } from "./views/analytics-view"
import { SettingsView } from "./views/setting-view"

export function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  
  const handleSetActiveView = (view: string, productId?: string) => {
    setActiveView(view)
    setSelectedProductId(productId || null)
  }

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />
      case "products":
        return <ProductsView setActiveView={handleSetActiveView} />
      case "create-product":
        return <CreateProductView setActiveView={handleSetActiveView} />
      case "edit-product":
        return selectedProductId ? (
          <EditProductView 
            productId={selectedProductId} 
            setActiveView={handleSetActiveView} 
          />
        ) : null
      case "orders":
        return <OrdersView />
      case "customers":
        return <CustomersView />
      case "analytics":
        return <AnalyticsView />
      case "settings":
        return <SettingsView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full bg-background relative">
      <AppSidebar
        activeView={activeView}
        setActiveView={handleSetActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Contenido principal que se ajusta dinámicamente */}
      <div
        className={`top-16 flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-64" : "ml-16"}`}
      >
        {/* Header del admin */}
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-[73px] items-center gap-4 px-6">
            {/* Botón toggle visible cuando sidebar está cerrado */}
            
            <div className="flex-1" />
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">{renderView()}</main>
      </div>

      {/* Overlay para mobile cuando está expandido */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}