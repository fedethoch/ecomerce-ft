// components/admin/app-sidebar.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  User,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  ArrowLeft,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAdminLayout } from "@/context/layout-context"

type AppSidebarProps = {
  open: boolean
  onToggle: () => void
}

const navigationItems = [
  { title: "Dashboard", icon: Home, id: "dashboard" },
  { title: "Productos", icon: Package, id: "products" },
  { title: "Pedidos", icon: ShoppingCart, id: "orders" },
  { title: "Clientes", icon: Users, id: "customer" },
  { title: "Analytics", icon: BarChart3, id: "analytics" },
  { title: "Configuración", icon: Settings, id: "settings" },
  { title: "Go back", icon: ArrowLeft, id: "back" },
]

// --- Helpers ruta <-> vista ---
function segmentsFromPath(pathname: string): string[] {
  const parts = pathname.replace(/^\/|\/$/g, "").split("/")
  const i = parts.indexOf("admin")
  return i >= 0 ? parts.slice(i + 1) : []
}

function activeViewFromPath(pathname: string): string {
  const [first] = segmentsFromPath(pathname)
  if (!first) return "dashboard"
  if (first === "products") return "products" // incluye /new y /:id/edit
  if (["orders", "customers", "analytics", "settings", "dashboard"].includes(first)) return first
  return "dashboard"
}

function pathForView(view: string): string {
  switch (view) {
    case "dashboard":
      return "/admin"
    case "products":
      return "/admin/products"
    case "orders":
      return "/admin/orders"
    case "customers":
      return "/admin/customers"
    case "analytics":
      return "/admin/analytics"
    case "settings":
      return "/admin/settings"
    case "back":
      return "/"
    default:
      return "/admin"
  }
}

export function AppSidebar() {
  const SB_OPEN_REM = "16rem" // w-64
  const SB_CLOSED_REM = "4rem" // w-16
  const sidebarRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [activeView, setActiveView] = useState<string>("dashboard")
  const { open, toggle } = useAdminLayout()
  // Sincroniza el activeView con la URL actual
  useEffect(() => {
    setActiveView(activeViewFromPath(pathname))
  }, [pathname])

  // Navegación desde el sidebar
  const handleNav = (viewId: string) => {
    if (viewId === "back") {
      router.push("/")
      return
    }

    const target = pathForView(viewId)
    if (target !== pathname) router.push(target, { scroll: false })
    setActiveView(viewId)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "fixed left-0 bg-background border-r flex flex-col justify-between z-40 transition-all duration-300 ease-in-out h-full top-0",
          open ? "w-64" : "w-16",
        )}
      >
        {/* Header del sidebar con botón toggle */}
        <div className="flex items-center justify-center p-4 border-b">
          {/* Logo + texto (colapsable) */}
          <div
            className={cn(
              "flex justify-center items-center gap-3 transition-all duration-200 overflow-hidden",
              open ? "flex-1 opacity-100" : "w-0 opacity-0",
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Admin Panel</span>
              <span className="truncate text-xs text-muted-foreground">Fashion Store</span>
            </div>
          </div>

          {/* Botón toggle con iconos animados */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggle} className="h-10 w-10 hover:bg-accent shrink-0">
                <div className="relative h-4 w-4">
                  <PanelLeft
                    className={cn(
                      "absolute inset-0 transition-all duration-300",
                      open ? "rotate-0 opacity-100" : "rotate-180 opacity-0",
                    )}
                  />
                  <PanelLeftClose
                    className={cn(
                      "absolute inset-0 transition-all duration-300",
                      open ? "rotate-180 opacity-0" : "rotate-0 opacity-100",
                    )}
                  />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{open ? "Colapsar sidebar" : "Expandir sidebar"}</TooltipContent>
          </Tooltip>
        </div>

        {/* Contenido del sidebar */}
        <div className="flex flex-col justify-start h-full items-center">
          {/* Navegación */}
          <div className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeView === item.id ? "secondary" : "ghost"}
                      className={cn(
                        "h-10 transition-all duration-200",
                        open ? "w-full justify-start gap-3" : "w-10 justify-center p-0",
                        activeView === item.id && "bg-accent text-accent-foreground",
                      )}
                      onClick={() => handleNav(item.id)}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {open && <span className="truncate">{item.title}</span>}
                    </Button>
                  </TooltipTrigger>
                  {!open && <TooltipContent side="right">{item.title}</TooltipContent>}
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Footer con usuario */}
          <div className="p-4 border-t">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "transition-all duration-200 hover:bg-accent",
                        open ? "w-full justify-start gap-3 h-12" : "w-10 h-10 justify-center p-0",
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      {open && (
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">Admin</span>
                          <span className="truncate text-xs text-muted-foreground">admin@fashionstore.com</span>
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                {!open && <TooltipContent side="right">Admin</TooltipContent>}
              </Tooltip>
              <DropdownMenuContent className="w-56" side="top" align="end" sideOffset={4}>
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
