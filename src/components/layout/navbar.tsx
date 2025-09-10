"use client";

import type React from "react";
import { useCart } from "@/context/cart-context";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ShoppingCart,
  User,
  Menu,
  Search,
  LogOut,
  ChevronDown,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Cart from "@/components/cart/Cart";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function Navbar() {
  const router = useRouter();
  const { cart, setIsOpen, isOpen } = useCart();
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const pathname = usePathname();

  const [suggestions, setSuggestions] = useState<
    Array<{ type: "product" | "category"; name: string; href?: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Estado para el usuario autenticado
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      if (data?.user) {
        checkUserRole(data.user.id);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          checkUserRole(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("users")
        .select("type_role")
        .eq("id", userId)
        .single();

      if (data && data.type_role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    setCartItems(cart.length);
  }, [cart]);

  useEffect(() => {
    const saved = localStorage.getItem("recent-searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const supabase = createClient();
    const suggestions: Array<{
      type: "product" | "category";
      name: string;
      href?: string;
    }> = [];

    try {
      const { data: products } = await supabase
        .from("products")
        .select("name, id")
        .ilike("name", `%${query}%`)
        .limit(5);

      if (products) {
        products.forEach((product) => {
          suggestions.push({
            type: "product",
            name: product.name,
            href: `/productos/${product.id}`,
          });
        });
      }

      const categoryMatches = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query.toLowerCase()) ||
          cat.subcategories.some((sub) =>
            sub.name.toLowerCase().includes(query.toLowerCase())
          )
      );

      categoryMatches.forEach((cat) => {
        if (cat.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            type: "category",
            name: cat.name,
            href: cat.href,
          });
        }
        cat.subcategories.forEach((sub) => {
          if (sub.name.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push({
              type: "category",
              name: sub.name,
              href: sub.href,
            });
          }
        });
      });

      setSuggestions(suggestions.slice(0, 8));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSuggestions(searchQuery.trim());
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newRecentSearches = [
        searchQuery.trim(),
        ...recentSearches.filter((s) => s !== searchQuery.trim()),
      ].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem(
        "recent-searches",
        JSON.stringify(newRecentSearches)
      );

      setShowSuggestions(false);
      router.push(
        `/productos?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  const handleSuggestionClick = (suggestion: {
    type: "product" | "category";
    name: string;
    href?: string;
  }) => {
    if (suggestion.href) {
      setSearchQuery("");
      setShowSuggestions(false);
      router.push(suggestion.href);
    } else {
      setSearchQuery(suggestion.name);
      setShowSuggestions(false);
      handleSearch(new Event("submit") as any);
    }
  };

  const categories = [
    {
      name: "Nuevo",
      href: "/productos?category=nuevo",
      subcategories: [
        {
          name: "Últimas llegadas",
          href: "/productos?category=nuevo&sort=latest",
        },
        { name: "Tendencias", href: "/productos?category=nuevo&featured=true" },
      ],
    },
    {
      name: "Hombre",
      href: "/productos?category=hombre",
      subcategories: [
        { name: "Remeras", href: "/productos?category=hombre&type=remeras" },
        {
          name: "Pantalones",
          href: "/productos?category=hombre&type=pantalones",
        },
        { name: "Buzos", href: "/productos?category=hombre&type=buzos" },
        { name: "Camperas", href: "/productos?category=hombre&type=camperas" },
        { name: "Calzado", href: "/productos?category=hombre&type=calzado" },
      ],
    },
    {
      name: "Mujer",
      href: "/productos?category=mujer",
      subcategories: [
        { name: "Remeras", href: "/productos?category=mujer&type=remeras" },
        {
          name: "Pantalones",
          href: "/productos?category=mujer&type=pantalones",
        },
        { name: "Buzos", href: "/productos?category=mujer&type=buzos" },
        { name: "Camperas", href: "/productos?category=mujer&type=camperas" },
        { name: "Calzado", href: "/productos?category=mujer&type=calzado" },
      ],
    },
    {
      name: "Niño/a",
      href: "/productos?category=ninos",
      subcategories: [
        { name: "Niños", href: "/productos?category=ninos&gender=boys" },
        { name: "Niñas", href: "/productos?category=ninos&gender=girls" },
        { name: "Bebés", href: "/productos?category=ninos&age=baby" },
      ],
    },
    {
      name: "Accesorios",
      href: "/productos?category=accesorios",
      subcategories: [
        { name: "Gorras", href: "/productos?category=accesorios&type=gorras" },
        {
          name: "Relojes",
          href: "/productos?category=accesorios&type=relojes",
        },
        {
          name: "Carteras",
          href: "/productos?category=accesorios&type=carteras",
        },
        {
          name: "Cinturones",
          href: "/productos?category=accesorios&type=cinturones",
        },
      ],
    },
    {
      name: "Ofertas",
      href: "/productos?category=ofertas",
      subcategories: [
        {
          name: "Hasta 30% OFF",
          href: "/productos?category=ofertas&discount=30",
        },
        {
          name: "Hasta 50% OFF",
          href: "/productos?category=ofertas&discount=50",
        },
        {
          name: "Liquidación",
          href: "/productos?category=ofertas&clearance=true",
        },
      ],
    },
  ];

  if (pathname.includes("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 h-[80px] w-full border-b border-[#E7E5E4] bg-[#F8F7F4]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F8F7F4]/90 shadow-lg">
        <div className="container mx-auto px-4">
          <div className=" flex h-20 items-center">
            {/* Left Section - Logo and Admin Button */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#172C6F] shadow-lg transform transition-transform hover:scale-105">
                  <span className="text-white text-xl font-bold">S</span>
                </div>
                <span className="text-[#0B1220] text-2xl font-bold tracking-tight">
                  StyleHub
                </span>
              </Link>
            </div>

            {/* Center Section - Categories */}
            <div className="absolute left-1/2 -translate-x-1/2 transform">
              <nav className="hidden items-center lg:flex">
                <div className="flex items-center space-x-1">
                  {categories.map((category) => (
                    <div
                      key={category.name}
                      className="group relative"
                      onMouseEnter={() => setHoveredCategory(category.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <Link
                        href={category.href}
                        className="relative flex items-center overflow-hidden rounded-lg px-4 py-3 text-sm font-semibold text-[#0B1220] transition-all duration-300 hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A]"
                      >
                        <span className="relative z-10">{category.name}</span>
                        <ChevronDown className="ml-1 h-3 w-3 transition-all duration-300 group-hover:rotate-180 group-hover:text-[#8B1E3F]" />
                        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-transparent via-[#D6C6B2]/20 to-transparent" />
                      </Link>

                      {/* Dropdown */}
                      <div
                        className={cn(
                          "absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 transform rounded-2xl border border-[#E7E5E4] bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-300",
                          hoveredCategory === category.name
                            ? "visible translate-y-0 opacity-100"
                            : "invisible translate-y-2 opacity-0"
                        )}
                      >
                        <div className="p-6">
                          <div className="grid gap-2">
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                className="group flex items-center gap-3 rounded-xl border border-transparent p-4 transition-all duration-200 hover:border-[#D6C6B2] hover:bg-[#D6C6B2]/15 hover:shadow-sm"
                              >
                                <div className="flex-1">
                                  <span className="block font-medium text-[#0B1220] transition-colors duration-200 group-hover:text-[#1E3A8A]">
                                    {sub.name}
                                  </span>
                                </div>
                                <div className="flex-shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                  <ChevronDown className="h-4 w-4 -rotate-90 text-[#6B7280]" />
                                </div>
                              </Link>
                            ))}
                          </div>

                          <div className="mt-5 border-t border-[#E7E5E4] pt-4">
                            <Link
                              href={category.href}
                              className="group flex items-center gap-2 text-sm font-semibold text-[#8B1E3F] transition-colors duration-200 hover:text-[#711732]"
                            >
                              <span>Ver toda la colección</span>
                              <ChevronDown className="h-3 w-3 -rotate-90 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </nav>
            </div>

            {/* Right Section - Search, User, Cart */}
            <div className="flex flex-1 items-center justify-end space-x-4">
              <div
                className="hidden items-center transition-all duration-300 ease-in-out md:flex"
                ref={searchRef}
              >
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <Input
                      placeholder="Buscar productos..."
                      className={cn(
                        "rounded-xl border-[#E7E5E4] bg-white pl-10 pr-4 py-3 text-[#0B1220] placeholder:text-[#6B7280] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:border-[#1E3A8A] shadow-sm",
                        isSearchFocused ? "w-70" : "w-52"
                      )}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        setIsSearchFocused(true);
                        if (
                          searchQuery.length >= 2 ||
                          recentSearches.length > 0
                        ) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          if (!showSuggestions) setIsSearchFocused(false);
                        }, 150);
                      }}
                    />

                    {showSuggestions && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-hidden rounded-xl border border-[#E7E5E4] bg-white shadow-2xl backdrop-blur-sm">
                        {suggestions.length > 0 && (
                          <div className="p-4">
                            <div className="mb-3 flex items-center gap-2 px-3 py-2">
                              <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#1E3A8A] to-[#8B1E3F]" />
                              <span className="text-xs font-semibold uppercase tracking-wide text-[#0B1220]">
                                Sugerencias
                              </span>
                            </div>
                            <div className="space-y-1">
                              {suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-left transition-all duration-200 hover:border-[#D6C6B2] hover:bg-[#D6C6B2]/20"
                                  onClick={() =>
                                    handleSuggestionClick(suggestion)
                                  }
                                >
                                  <div className="flex-shrink-0">
                                    {suggestion.type === "product" ? (
                                      <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#172C6F] shadow-sm transition-transform duration-200 group-hover:scale-110" />
                                    ) : (
                                      <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#8B1E3F] to-[#711732] shadow-sm transition-transform duration-200 group-hover:scale-110" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-[#0B1220] transition-colors duration-200 group-hover:text-[#1E3A8A]">
                                      {suggestion.name}
                                    </span>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <span className="rounded-full px-3 py-1 text-xs font-medium text-[#6B7280] bg-[#F8F7F4] group-hover:bg-[#D6C6B2]/30 group-hover:text-[#0B1220] transition-all duration-200">
                                      {suggestion.type === "product"
                                        ? "Producto"
                                        : "Categoría"}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {recentSearches.length > 0 && (
                          <div className="border-t border-[#E7E5E4] bg-gradient-to-b from-[#F8F7F4]/30 to-[#F8F7F4]/10">
                            <div className="p-4">
                              <div className="mb-3 flex items-center gap-2 px-3 py-2">
                                <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#6B7280] to-[#D6C6B2]" />
                                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                                  Búsquedas recientes
                                </span>
                              </div>
                              <div className="space-y-1">
                                {recentSearches.map((search, index) => (
                                  <button
                                    key={index}
                                    className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-4 py-3 transition-all duration-200 hover:border-[#E7E5E4] hover:bg-white/60 hover:shadow-sm"
                                    onClick={() => {
                                      setSearchQuery(search);
                                      setShowSuggestions(false);
                                      router.push(
                                        `/productos?search=${encodeURIComponent(search)}`
                                      );
                                    }}
                                  >
                                    <div className="flex-shrink-0">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#F8F7F4] to-[#D6C6B2] shadow-sm transition-all duration-200 group-hover:from-[#D6C6B2] group-hover:to-[#F8F7F4]">
                                        <Search className="h-3.5 w-3.5 text-[#6B7280] transition-colors duration-200 group-hover:text-[#0B1220]" />
                                      </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="block truncate text-sm font-medium text-[#0B1220] transition-colors duration-200 group-hover:text-[#1E3A8A]">
                                        {search}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {suggestions.length === 0 &&
                          recentSearches.length === 0 &&
                          searchQuery.length >= 2 && (
                            <div className="p-8 text-center">
                              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F8F7F4] to-[#D6C6B2] shadow-sm">
                                <Search className="h-5 w-5 text-[#6B7280]" />
                              </div>
                              <p className="mb-1 text-sm font-medium text-[#6B7280]">
                                No se encontraron sugerencias
                              </p>
                              <p className="text-xs text-[#6B7280]">
                                Intenta con otros términos de búsqueda
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* User and Cart Actions */}
              <div className="flex flex-shrink-0 items-center space-x-3">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="rounded-xl p-2 hover:bg-[#D6C6B2]/30 transition-all duration-200"
                      >
                        <Avatar className="h-9 w-9 border-2 border-[#E7E5E4] shadow-sm">
                          <AvatarImage
                            src={
                              user.user_metadata?.avatar_url ||
                              "/placeholder.svg?height=36&width=36&query=user profile avatar" ||
                              "/placeholder.svg"
                            }
                            alt={user.email || "User"}
                          />
                          <AvatarFallback className="bg-[#1E3A8A] text-white font-semibold">
                            {user.email ? user.email[0].toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 border-[#E7E5E4] bg-white shadow-xl rounded-xl"
                      align="end"
                    >
                      <DropdownMenuLabel className="text-[#0B1220] font-semibold">
                        Mi Cuenta
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#E7E5E4]" />
                      {isAdmin && (
                        <>
                          <DropdownMenuItem
                            onClick={() => router.push("/admin/dashboard")}
                            className="text-[#8B1E3F] hover:bg-[#8B1E3F]/10 hover:text-[#711732] focus:bg-[#8B1E3F]/10 font-medium"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Panel Admin</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#E7E5E4]" />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => router.push("/profile")}
                        className="text-[#6B7280] hover:bg-[#D6C6B2]/20 hover:text-[#0B1220] focus:bg-[#D6C6B2]/20"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-[#8B1E3F] hover:bg-[#8B1E3F]/10 hover:text-[#711732] focus:bg-[#8B1E3F]/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden h-11 w-11 rounded-xl text-[#0B1220] hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A] md:flex transition-all duration-200"
                    onClick={() => router.push("/register")}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-11 w-11 rounded-xl text-[#0B1220] hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A] transition-all duration-200"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#F8F7F4] p-0 bg-[#8B1E3F] text-white hover:bg-[#711732] text-xs font-semibold shadow-lg"
                    >
                      {cartItems}
                    </Badge>
                  )}
                </Button>

                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-xl text-[#0B1220] hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A] lg:hidden transition-all duration-200"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-80 border-l-[#E7E5E4] bg-[#F8F7F4]"
                  >
                    <div className="mt-8 flex flex-col space-y-6">
                      {/* Mobile Search */}
                      <div className="md:hidden">
                        <form onSubmit={handleSearch} className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform h-4 w-4 text-[#6B7280]" />
                          <Input
                            placeholder="Buscar productos..."
                            className="bg-white pl-10 text-[#0B1220] placeholder:text-[#6B7280] border-[#E7E5E4] focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </form>
                      </div>

                      {/* Mobile Categories */}
                      <div className="space-y-4">
                        {categories.map((category) => (
                          <div key={category.name} className="space-y-2">
                            <Link
                              href={category.href}
                              className="block text-lg font-bold text-[#0B1220] hover:text-[#1E3A8A] transition-colors duration-200"
                            >
                              {category.name}
                            </Link>
                            <div className="space-y-1 pl-4">
                              {category.subcategories.map((sub) => (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  className="block py-2 text-sm text-[#6B7280] hover:text-[#0B1220] transition-colors duration-200"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Mobile User Actions */}
                      <div className="space-y-3 border-t border-[#E7E5E4] pt-6">
                        {user ? (
                          <>
                            {isAdmin && (
                              <Button
                                className="w-full bg-[#8B1E3F] hover:bg-[#711732] text-white font-semibold rounded-xl py-3 transition-all duration-200"
                                onClick={() => router.push("/admin/dashboard")}
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Panel Admin
                              </Button>
                            )}
                            <Button
                              className="w-full bg-[#1E3A8A] hover:bg-[#172C6F] text-white font-semibold rounded-xl py-3 transition-all duration-200"
                              onClick={() => router.push("/profile")}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Mi Perfil
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full border-[#8B1E3F] text-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white font-semibold rounded-xl py-3 transition-all duration-200 bg-transparent"
                              onClick={handleLogout}
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Cerrar Sesión
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="w-full bg-[#1E3A8A] hover:bg-[#172C6F] text-white font-semibold rounded-xl py-3 transition-all duration-200"
                            onClick={() => router.push("/register")}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Registrarse
                          </Button>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Cart />
    </>
  );
}
