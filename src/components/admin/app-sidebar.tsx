// components/admin/app-sidebar.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminLayout } from "@/context/layout-context";
import * as Dialog from "@radix-ui/react-dialog";

type AppSidebarProps = {
  open: boolean;
  onToggle: () => void;
};

const navigationItems = [
  { title: "Dashboard", icon: Home, id: "dashboard" },
  { title: "Productos", icon: Package, id: "products" },
  { title: "Pedidos", icon: ShoppingCart, id: "orders" },
  { title: "Clientes", icon: Users, id: "customer" },
  { title: "Analytics", icon: BarChart3, id: "analytics" },
  { title: "Configuración", icon: Settings, id: "settings" },
  { title: "Go back", icon: ArrowLeft, id: "back" },
];

// --- Helpers ruta <-> vista ---
function segmentsFromPath(pathname: string): string[] {
  const parts = pathname.replace(/^\/|\/$/g, "").split("/");
  const i = parts.indexOf("admin");
  return i >= 0 ? parts.slice(i + 1) : [];
}

function activeViewFromPath(pathname: string): string {
  const [first] = segmentsFromPath(pathname);
  if (!first) return "dashboard";
  if (first === "products") return "products"; // incluye /new y /:id/edit
  if (
    ["orders", "customer", "analytics", "settings", "dashboard"].includes(first)
  )
    return first;
  return "dashboard";
}

function pathForView(view: string): string {
  switch (view) {
    case "dashboard":
      return "/admin/dashboard";
    case "products":
      return "/admin/products";
    case "orders":
      return "/admin/orders";
    case "customer":
      return "/admin/customer";
    case "analytics":
      return "/admin/analytics";
    case "settings":
      return "/admin/settings";
    case "back":
      return "/";
    default:
      return "/admin/dashboard";
  }
}

function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeView, setActiveView] = useState(activeViewFromPath(pathname));

  const handleNavigation = (view: string) => {
    setActiveView(view);
    router.push(pathForView(view));
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed inset-y-0 left-0 w-[300px] bg-white p-6 shadow-lg z-50 animate-in slide-in-from-left">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-2 flex-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    activeView === item.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function AppSidebar() {
  const SB_OPEN_REM = "16rem"; // w-64
  const SB_CLOSED_REM = "4rem"; // w-16
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [activeView, setActiveView] = useState<string>("dashboard");
  const { open, toggle } = useAdminLayout();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sincroniza el activeView con la URL actual
  useEffect(() => {
    setActiveView(activeViewFromPath(pathname));
  }, [pathname]);

  // Navegación desde el sidebar
  const handleNav = (viewId: string) => {
    if (viewId === "back") {
      router.push("/");
      return;
    }

    const target = pathForView(viewId);
    if (target !== pathname) router.push(target, { scroll: false });
    setActiveView(viewId);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 md:hidden z-50"
        onClick={() => setIsMobileDrawerOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Desktop Sidebar - Hidden on mobile */}
      <TooltipProvider delayDuration={0}>
        <div
          className={cn(
            "fixed left-0 bg-white border-r z-40 h-full top-0",
            "hidden md:flex md:flex-col",
            "w-16 transition-all duration-300 ease-in-out",
            open && "w-64"
          )}
        >
          {/* Header del sidebar con botón toggle */}
          <div className="flex items-center justify-center p-4 border-b">
            {/* Logo + texto (colapsable) */}
            <div
              className={cn(
                "flex items-center gap-3 transition-all duration-300 ease-in-out overflow-hidden",
                open ? "w-full opacity-100" : "w-0 opacity-0 translate-x-4"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Package className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Admin Panel</span>
                <span className="truncate text-xs text-muted-foreground">
                  Fashion Store
                </span>
              </div>
            </div>

            {/* Botón toggle con iconos animados */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggle}
                  className="h-10 w-10 hover:bg-accent shrink-0"
                >
                  <div className="relative h-4 w-4">
                    <PanelLeft
                      className={cn(
                        "absolute inset-0 transition-all duration-300",
                        open ? "rotate-0 opacity-100" : "rotate-180 opacity-0"
                      )}
                    />
                    <PanelLeftClose
                      className={cn(
                        "absolute inset-0 transition-all duration-300",
                        open ? "rotate-180 opacity-0" : "rotate-0 opacity-100"
                      )}
                    />
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {open ? "Colapsar sidebar" : "Expandir sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Contenido del sidebar */}
          <div className="flex flex-col h-full w-full">
            {/* Navegación */}
            <div className="flex-1 p-4">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeView === item.id ? "secondary" : "ghost"}
                        className={cn(
                          "h-10 transition-all duration-300 ease-in-out",
                          open
                            ? "w-full justify-start gap-3"
                            : "w-10 justify-center p-0",
                          activeView === item.id &&
                            "bg-accent text-accent-foreground"
                        )}
                        onClick={() => handleNav(item.id)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {open && <span className="truncate">{item.title}</span>}
                      </Button>
                    </TooltipTrigger>
                    {!open && (
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* User Profile */}
            <div className="border-t p-4">
              {open ? (
                // Expanded version with dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 px-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start text-sm">
                        <span className="font-medium">Admin User</span>
                        <span className="text-xs text-muted-foreground">
                          admin@example.com
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Collapsed version with tooltip
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Admin User</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}
