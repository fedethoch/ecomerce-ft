"use client";

import type React from "react";
import { useCart } from "@/context/cart-context";
import { useState, useEffect, useRef } from "react";
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
  X,
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
import path from "path";

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
      { name: "Pantalones", href: "/productos?category=mujer&type=pantalones" },
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
      { name: "Relojes", href: "/productos?category=accesorios&type=relojes" },
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

export function Navbar() {
  const router = useRouter();
  const { cart, setIsOpen, isOpen } = useCart();
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [suggestions, setSuggestions] = useState<
    Array<{ type: "product" | "category"; name: string; href?: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUser(data?.user || null);
        if (data?.user) checkUserRole(data.user.id);
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

      return () => listener?.subscription.unsubscribe();
    } catch (error) {
      console.log("Demo mode: Supabase not configured");
    }
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("type_role")
        .eq("id", userId)
        .single();
      setIsAdmin(data?.type_role === "admin");
    } catch (error) {
      setIsAdmin(false);
    }
  };

  useEffect(() => setCartItems(cart.length), [cart]);

  useEffect(() => {
    const saved = localStorage.getItem("recent-searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const categoryMatches = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query.toLowerCase()) ||
        cat.subcategories.some((sub) =>
          sub.name.toLowerCase().includes(query.toLowerCase())
        )
    );

    const fallbackSuggestions: Array<{
      type: "product" | "category";
      name: string;
      href?: string;
    }> = [];
    categoryMatches.forEach((cat) => {
      if (cat.name.toLowerCase().includes(query.toLowerCase())) {
        fallbackSuggestions.push({
          type: "category",
          name: cat.name,
          href: cat.href,
        });
      }
      cat.subcategories.forEach((sub) => {
        if (sub.name.toLowerCase().includes(query.toLowerCase())) {
          fallbackSuggestions.push({
            type: "category",
            name: sub.name,
            href: sub.href,
          });
        }
      });
    });
    setSuggestions(fallbackSuggestions.slice(0, 8));
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
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.log("Demo mode: Logout simulation");
    }
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
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
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
    }
  };

  const toggleMobileCategory = (categoryName: string) => {
    setExpandedCategory(
      expandedCategory === categoryName ? null : categoryName
    );
  };

  if (
    pathname.includes("/admin") ||
    pathname.includes("/register") ||
    pathname.includes("/login")
  )
    return null;

  return (
    <>
      <header className="sticky top-0 z-50 h-16 sm:h-20 w-full border-b border-[#E7E5E4] bg-[#F8F7F4]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F8F7F4]/90 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <Link
                href="/"
                className="flex items-center space-x-2 sm:space-x-3"
              >
                <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#172C6F] shadow-lg transform transition-transform hover:scale-105">
                  <span className="text-white text-sm sm:text-xl font-bold">
                    S
                  </span>
                </div>
                <span className="text-[#0B1220] text-lg sm:text-2xl font-bold tracking-tight hidden xs:block">
                  StyleHub
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="absolute left-1/2 -translate-x-1/2 transform hidden lg:block">
              <nav className="flex items-center">
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
                        className="relative flex items-center overflow-hidden rounded-lg px-3 xl:px-4 py-2 xl:py-3 text-xs xl:text-sm font-semibold text-[#0B1220] transition-all duration-300 hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A]"
                      >
                        <span className="relative z-10">{category.name}</span>
                        <ChevronDown className="ml-1 h-3 w-3 transition-all duration-300 group-hover:rotate-180 group-hover:text-[#8B1E3F]" />
                        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-transparent via-[#D6C6B2]/20 to-transparent" />
                      </Link>

                      {/* Desktop Dropdown */}
                      <div
                        className={cn(
                          "absolute left-1/2 top-full z-50 mt-3 w-64 xl:w-72 -translate-x-1/2 transform rounded-2xl border border-[#E7E5E4] bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-300",
                          hoveredCategory === category.name
                            ? "visible translate-y-0 opacity-100"
                            : "invisible translate-y-2 opacity-0"
                        )}
                      >
                        <div className="p-4 xl:p-6">
                          <div className="grid gap-1 xl:gap-2">
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                className="group flex items-center gap-3 rounded-xl border border-transparent p-3 xl:p-4 transition-all duration-200 hover:border-[#D6C6B2] hover:bg-[#D6C6B2]/15 hover:shadow-sm"
                              >
                                <div className="flex-1">
                                  <span className="block font-medium text-sm xl:text-base text-[#0B1220] transition-colors duration-200 group-hover:text-[#1E3A8A]">
                                    {sub.name}
                                  </span>
                                </div>
                                <div className="flex-shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                  <ChevronDown className="h-4 w-4 -rotate-90 text-[#6B7280]" />
                                </div>
                              </Link>
                            ))}
                          </div>
                          <div className="mt-4 xl:mt-5 border-t border-[#E7E5E4] pt-3 xl:pt-4">
                            <Link
                              href={category.href}
                              className="group flex items-center gap-2 text-xs xl:text-sm font-semibold text-[#8B1E3F] transition-colors duration-200 hover:text-[#711732]"
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

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Desktop Search */}
              <div
                className="hidden md:flex items-center transition-all duration-300 ease-in-out"
                ref={searchRef}
              >
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <Input
                      placeholder="Buscar productos..."
                      className={cn(
                        "rounded-xl border-[#E7E5E4] bg-white pl-10 pr-4 py-2 sm:py-3 text-[#0B1220] placeholder:text-[#6B7280] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:border-[#1E3A8A] shadow-sm text-sm",
                        isSearchFocused ? "w-56 lg:w-70" : "w-40 lg:w-52"
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

                    {showSuggestions &&
                      (suggestions.length > 0 || recentSearches.length > 0) && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 lg:max-h-96 overflow-hidden rounded-xl border border-[#E7E5E4] bg-white shadow-2xl backdrop-blur-sm">
                          <div className="max-h-80 lg:max-h-96 overflow-y-auto">
                            {suggestions.length > 0 && (
                              <div className="p-2">
                                <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide px-3 py-2">
                                  Sugerencias
                                </div>
                                {suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() =>
                                      handleSuggestionClick(suggestion)
                                    }
                                    className="w-full text-left px-3 py-2.5 hover:bg-[#D6C6B2]/20 rounded-lg transition-colors duration-150 flex items-center gap-3"
                                  >
                                    <Search className="h-4 w-4 text-[#6B7280] flex-shrink-0" />
                                    <span className="text-sm text-[#0B1220] truncate">
                                      {suggestion.name}
                                    </span>
                                    <span className="text-xs text-[#6B7280] ml-auto flex-shrink-0 capitalize">
                                      {suggestion.type}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {recentSearches.length > 0 &&
                              suggestions.length === 0 && (
                                <div className="p-2">
                                  <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide px-3 py-2">
                                    Búsquedas recientes
                                  </div>
                                  {recentSearches.map((search, index) => (
                                    <button
                                      key={index}
                                      onClick={() => {
                                        setSearchQuery(search);
                                        setShowSuggestions(false);
                                        router.push(
                                          `/?search=${encodeURIComponent(search)}`
                                        );
                                      }}
                                      className="w-full text-left px-3 py-2.5 hover:bg-[#D6C6B2]/20 rounded-lg transition-colors duration-150 flex items-center gap-3"
                                    >
                                      <Search className="h-4 w-4 text-[#6B7280] flex-shrink-0" />
                                      <span className="text-sm text-[#0B1220] truncate">
                                        {search}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                  </div>
                </form>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="rounded-lg sm:rounded-xl p-1.5 sm:p-2 hover:bg-[#D6C6B2]/30 transition-all duration-200"
                      >
                        <Avatar className="h-7 w-7 sm:h-9 sm:w-9 border-2 border-[#E7E5E4] shadow-sm">
                          <AvatarImage
                            src={
                              user.user_metadata?.avatar_url ||
                              "/placeholder.svg?height=36&width=36&query=user profile avatar" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={user.email || "User"}
                          />
                          <AvatarFallback className="bg-[#1E3A8A] text-white font-semibold text-xs sm:text-sm">
                            {user.email ? user.email[0].toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 sm:w-56 border-[#E7E5E4] bg-white shadow-xl rounded-xl"
                      align="end"
                    >
                      <DropdownMenuLabel className="text-[#0B1220] font-semibold text-sm">
                        Mi Cuenta
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#E7E5E4]" />
                      {isAdmin && (
                        <>
                          <DropdownMenuItem
                            onClick={() => router.push("/admin/dashboard")}
                            className="text-[#8B1E3F] hover:bg-[#8B1E3F]/10 hover:text-[#711732] focus:bg-[#8B1E3F]/10 font-medium text-sm"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Panel Admin</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#E7E5E4]" />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => router.push("/profile")}
                        className="text-[#6B7280] hover:bg-[#D6C6B2]/20 hover:text-[#0B1220] focus:bg-[#D6C6B2]/20 text-sm"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-[#8B1E3F] hover:bg-[#8B1E3F]/10 hover:text-[#711732] focus:bg-[#8B1E3F]/10 text-sm"
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
                    className="hidden sm:flex h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl text-[#0B1220] hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A] transition-all duration-200"
                    onClick={() => router.push("/register")}
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                )}

                {/* Cart Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl text-[#0B1220] hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A] transition-all duration-200"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  {cartItems > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-2 border-[#F8F7F4] p-0 bg-[#8B1E3F] text-white hover:bg-[#711732] text-xs font-semibold shadow-lg"
                    >
                      {cartItems}
                    </Badge>
                  )}
                </Button>

                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl text-[#0B1220] hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A] lg:hidden transition-all duration-200"
                    >
                      <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full sm:w-80 max-w-sm border-l-[#E7E5E4] bg-[#F8F7F4] p-0 overflow-y-auto"
                  >
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-[#E7E5E4] bg-white/50 sticky top-0 z-10">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#172C6F] shadow-sm">
                            <span className="text-white text-sm font-bold">
                              S
                            </span>
                          </div>
                          <span className="text-[#0B1220] text-lg font-bold">
                            StyleHub
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="h-8 w-8 rounded-lg hover:bg-[#D6C6B2]/30"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 space-y-6">
                        <div className="block md:hidden">
                          <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform h-4 w-4 text-[#6B7280]" />
                            <Input
                              placeholder="Buscar productos..."
                              className="bg-white pl-10 text-[#0B1220] placeholder:text-[#6B7280] border-[#E7E5E4] focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded-xl py-3 h-12"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSearch(e as any);
                                  setIsMobileMenuOpen(false);
                                }
                              }}
                            />
                          </form>
                        </div>

                        {/* Categories with Working Dropdowns */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
                            Categorías
                          </h3>
                          <div className="space-y-2">
                            {categories.map((category) => (
                              <div key={category.name} className="space-y-1">
                                <div className="flex items-center">
                                  <Link
                                    href={category.href}
                                    className="flex-1 flex items-center p-3 rounded-xl bg-white/60 hover:bg-white transition-all duration-200 group"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    <span className="text-base font-semibold text-[#0B1220] group-hover:text-[#1E3A8A]">
                                      {category.name}
                                    </span>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      toggleMobileCategory(category.name)
                                    }
                                    className="ml-2 h-10 w-10 rounded-lg hover:bg-white/60 transition-all duration-200"
                                  >
                                    <ChevronDown
                                      className={cn(
                                        "h-4 w-4 text-[#6B7280] transition-transform duration-200",
                                        expandedCategory === category.name
                                          ? "rotate-180"
                                          : ""
                                      )}
                                    />
                                  </Button>
                                </div>

                                {/* Subcategories with smooth animation */}
                                <div
                                  className={cn(
                                    "overflow-hidden transition-all duration-300 ease-in-out",
                                    expandedCategory === category.name
                                      ? "max-h-96 opacity-100"
                                      : "max-h-0 opacity-0"
                                  )}
                                >
                                  <div className="pl-4 space-y-1 pt-1">
                                    {category.subcategories.map((sub) => (
                                      <Link
                                        key={sub.name}
                                        href={sub.href}
                                        onClick={() =>
                                          setIsMobileMenuOpen(false)
                                        }
                                        className="flex items-center py-2.5 px-3 text-sm text-[#6B7280] hover:text-[#0B1220] hover:bg-white/40 rounded-lg transition-all duration-200 min-h-[44px] group"
                                      >
                                        <span className="flex-1">
                                          {sub.name}
                                        </span>
                                        <ChevronDown className="h-3 w-3 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 border-t bg-white border-[#E7E5E4] space-y-3 fixed bottom-0">
                        {user ? (
                          <>
                            {isAdmin && (
                              <Button
                                className="w-full bg-[#8B1E3F] hover:bg-[#711732] text-white font-semibold rounded-xl h-12 transition-all duration-200"
                                onClick={() => {
                                  router.push("/admin/dashboard");
                                  setIsMobileMenuOpen(false);
                                }}
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Panel Admin
                              </Button>
                            )}
                            <Button
                              className="w-full bg-[#1E3A8A] hover:bg-[#172C6F] text-white font-semibold rounded-xl h-12 transition-all duration-200"
                              onClick={() => {
                                router.push("/profile");
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Mi Perfil
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full border-[#8B1E3F] text-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white font-semibold rounded-xl h-12 transition-all duration-200 bg-white/60"
                              onClick={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Cerrar Sesión
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="w-full bg-[#1E3A8A] hover:bg-[#172C6F] text-white font-semibold rounded-xl h-12 transition-all duration-200"
                            onClick={() => {
                              router.push("/register");
                              setIsMobileMenuOpen(false);
                            }}
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
