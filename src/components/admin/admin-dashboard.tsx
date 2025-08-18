"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./app-sidebar";
import { DashboardView } from "./views/dashboard-view";
import { ProductsView } from "./views/products-view";
import { CreateProductView } from "./views/create-product";
import { EditProductView } from "./views/edit-product"; // Nuevo componente
import { OrdersView } from "./views/orders-view";
import { CustomersView } from "./views/customer-view";
import { AnalyticsView } from "./views/analytics-view";
import { SettingsView } from "./views/setting-view";

export function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const handleSetActiveView = (view: string, productId?: string) => {
    setActiveView(view);
    setSelectedProductId(productId || null);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full bg-background relative"></div>
  );
}
