"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Productos",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Pedidos",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Clientes",
    href: "/admin/customer",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
];

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 p-2 bg-background border border-border rounded-lg shadow-sm md:hidden"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-foreground" />
        ) : (
          <Menu className="h-6 w-6 text-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMenu}
          />

          {/* Menu content */}
          <div className="relative h-full bg-background">
            <div className="flex flex-col h-full pt-20 px-6">
              {/* Navigation items */}
              <nav className="flex-1">
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={`
                          flex items-center gap-4 px-4 py-4 rounded-lg text-lg font-medium transition-colors
                          ${
                            isActive
                              ? "text-primary bg-primary/10 border border-primary/20"
                              : "text-foreground hover:text-primary hover:bg-accent"
                          }
                        `}
                      >
                        <Icon className="h-6 w-6" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Footer */}
              <div className="py-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Admin Panel
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
