"use client"

import { useState } from "react"
import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/app-sidebar"
import { DashboardView } from "@/components/views/dashboard-view"
import { ProductsView } from "@/components/views/products-view"
import { CreateProductView } from "@/components/views/create-product-view"
import { OrdersView } from "@/components/views/orders-view"
import { CustomersView } from "@/components/views/customers-view"
import { AnalyticsView } from "@/components/views/analytics-view"
import { SettingsView } from "@/components/views/settings-view"

export function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard")

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />
      case "products":
        return <ProductsView setActiveView={setActiveView} />
      case "create-product":
        return <CreateProductView setActiveView={setActiveView} />
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
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex-1">
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1" />
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">{renderView()}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
