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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import path from "path";

const categories = [
  {
    name: "Nuevo",
    href: "/productos?isNew=true",
    subcategories: [
      {
        name: "Últimas llegadas",
        href: "/productos?isNew=true&sort=latest",
      },
      { name: "Tendencias", href: "/productos?isNew=true" },
    ],
  },
  {
    name: "Adulto",
    href: "/productos",
    subcategories: [
      { name: "Camisetas", href: "/productos?category=camisetas" },
      {
        name: "Pantalones",
        href: "/productos?category=pantalones",
      },
      { name: "Chaquetas", href: "/productos?category=chaquetas" },
      { name: "Calzado", href: "/productos?category=calzado" },
    ],
  },
  {
    name: "Niño/a",
    href: "/productos",
    subcategories: [
      { name: "Niños", href: "/productos" },
      { name: "Niñas", href: "/productos" },
      { name: "Bebes", href: "/productos" },
    ],
  },
  {
    name: "Accesorios",
    href: "/productos?category=accesorios",
  },
  {
    name: "Ofertas",
    href: "/productos?isSale=true",
  },
];

export function Navbar() {
  const router = useRouter();
  const { cart, setIsOpen, isOpen } = useCart();
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const pathname = usePathname();

  const [suggestions, setSuggestions] = useState<
    Array<{
      type: "product" | "category";
      name: string;
      href?: string;
      image?: string;
      price?: number;
    }>
  >([]);
  const [mobileSuggestions, setMobileSuggestions] = useState<
    Array<{
      type: "product" | "category";
      name: string;
      href?: string;
      image?: string;
      price?: number;
    }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

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
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    const supabase = createClient();
    const suggestions: Array<{
      type: "product" | "category";
      name: string;
      href?: string;
      image?: string;
      price?: number;
    }> = [];

    try {
      // escapa comodines para ilike
      const escaped = q.replace(/[%_]/g, "\\$&");

      // --- MODIFICACIÓN 1 (DESKTOP) ---
      const { data: products, error } = await supabase
        .from("products")
        .select("name, id, image_paths, price") // Corregido: image_url -> image_paths
        .ilike("name", `%${escaped}%`)
        .limit(5);

      if (error) {
        console.error("Error fetching products:", error.message);
      }
      // --- FIN MODIFICACIÓN 1 ---

      // si el usuario ya cambió el texto, no pisar con resultados viejos
      if (q !== searchQuery.trim()) return;

      if (products) {
        products.forEach((product) => {
          suggestions.push({
            type: "product",
            name: product.name,
            href: `/productos/${product.id}`,
            // --- MODIFICACIÓN 2 (DESKTOP) ---
            // Tomamos la primera imagen del array image_paths
            image:
              product.image_paths && product.image_paths[0]
                ? product.image_paths[0]
                : undefined,
            // --- FIN MODIFICACIÓN 2 ---
            price: product.price,
          });
        });
      }

      const qLower = q.toLowerCase();
      const categoryMatches = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(qLower) ||
          (cat.subcategories && // Comprobar si subcategories existe
            cat.subcategories.some((sub) =>
              sub.name.toLowerCase().includes(qLower)
            ))
      );

      categoryMatches.forEach((cat) => {
        if (cat.name.toLowerCase().includes(qLower)) {
          suggestions.push({
            type: "category",
            name: cat.name,
            href: cat.href,
          });
        }
        if (cat.subcategories) {
          // Comprobar si subcategories existe
          cat.subcategories.forEach((sub) => {
            if (sub.name.toLowerCase().includes(qLower)) {
              suggestions.push({
                type: "category",
                name: sub.name,
                href: sub.href,
              });
            }
          });
        }
      });

      setSuggestions(suggestions.slice(0, 8));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const fetchMobileSuggestions = async (query: string) => {
    const q = query.trim();
    if (q.length < 2) {
      setMobileSuggestions([]);
      return;
    }

    const supabase = createClient();
    const suggestions: Array<{
      type: "product" | "category";
      name: string;
      href?: string;
      image?: string;
      price?: number;
    }> = [];

    try {
      const escaped = q.replace(/[%_]/g, "\\$&");

      // --- MODIFICACIÓN 3 (MOBILE) ---
      const { data: products, error } = await supabase
        .from("products")
        .select("name, id, image_paths, price") // Corregido: image_url -> image_paths
        .ilike("name", `%${escaped}%`)
        .limit(5);

      if (error) {
        console.error("Error fetching mobile products:", error.message);
      }
      // --- FIN MODIFICACIÓN 3 ---

      if (q !== mobileSearchQuery.trim()) return;

      if (products) {
        products.forEach((product) => {
          suggestions.push({
            type: "product",
            name: product.name,
            href: `/productos/${product.id}`,
            // --- MODIFICACIÓN 4 (MOBILE) ---
            image:
              product.image_paths && product.image_paths[0]
                ? product.image_paths[0]
                : undefined,
            // --- FIN MODIFICACIÓN 4 ---
            price: product.price,
          });
        });
      }

      const qLower = q.toLowerCase();
      const categoryMatches = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(qLower) ||
          (cat.subcategories && // Comprobar si subcategories existe
            cat.subcategories.some((sub) =>
              sub.name.toLowerCase().includes(qLower)
            ))
      );

      categoryMatches.forEach((cat) => {
        if (cat.name.toLowerCase().includes(qLower)) {
          suggestions.push({
            type: "category",
            name: cat.name,
            href: cat.href,
          });
        }
        if (cat.subcategories) {
          // Comprobar si subcategories existe
          cat.subcategories.forEach((sub) => {
            if (sub.name.toLowerCase().includes(qLower)) {
              suggestions.push({
                type: "category",
                name: sub.name,
                href: sub.href,
              });
            }
          });
        }
      });

      setMobileSuggestions(suggestions.slice(0, 8));
    } catch (error) {
      console.error("Error fetching mobile suggestions:", error);
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
    const timeoutId = setTimeout(() => {
      if (mobileSearchQuery.trim()) {
        fetchMobileSuggestions(mobileSearchQuery.trim());
        setShowMobileSuggestions(true);
      } else {
        setMobileSuggestions([]);
        setShowMobileSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [mobileSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setShowMobileSuggestions(false);
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

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      const newRecentSearches = [
        mobileSearchQuery.trim(),
        ...recentSearches.filter((s) => s !== mobileSearchQuery.trim()),
      ].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem(
        "recent-searches",
        JSON.stringify(newRecentSearches)
      );

      setShowMobileSuggestions(false);
      router.push(
        `/productos?search=${encodeURIComponent(mobileSearchQuery.trim())}`
      );
    }
  };

  const handleSuggestionClick = (suggestion: {
    type: "product" | "category";
    name: string;
    href?: string;
    image?: string;
    price?: number;
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

  const handleMobileSuggestionClick = (suggestion: {
    type: "product" | "category";
    name: string;
    href?: string;
    image?: string;
    price?: number;
  }) => {
    if (suggestion.href) {
      setMobileSearchQuery("");
      setShowMobileSuggestions(false);
      router.push(suggestion.href);
    } else {
      setMobileSearchQuery(suggestion.name);
      setShowMobileSuggestions(false);
      handleMobileSearch(new Event("submit") as any);
    }
  };

  if (
    pathname.includes("/admin") ||
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/auth/callback") ||
    pathname.includes("/verify")
  ) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 h-[80px] w-full border-b border-[#E7E5E4] bg-[#F8F7F4]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F8F7F4]/90 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-20 items-center">
            {/* Left Section - Logo and Admin Button */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 sm:space-x-3"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#172C6F] shadow-lg transform transition-transform hover:scale-105">
                  <span className="text-white text-lg sm:text-xl font-bold">
                    S
                  </span>
                </div>
                <span className="text-[#0B1220] text-xl sm:text-2xl font-bold tracking-tight">
                  StyleHub
                </span>
              </Link>
            </div>

            {/* Center Section - Categories */}
            <div className="absolute left-1/2 -translate-x-1/2 transform">
              <nav className="hidden items-center lg:flex">
                <div className="flex items-center space-x-1">
                  {/* --- Lógica de renderizado condicional --- */}
                  {categories.map((category) => {
                    const hasDropdown =
                      category.subcategories &&
                      category.subcategories.length > 0;

                    return hasDropdown ? (
                      // --- LÓGICA (CON DROPDOWN) ---
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

                        {/* --- Dropdown opaco --- */}
                        <div
                          className={cn(
                            "absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 transform rounded-2xl border border-[#E7E5E4] bg-white shadow-2xl transition-all duration-300",
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
                    ) : (
                      // --- LÓGICA (SOLO ENLACE) ---
                      <div key={category.name} className="relative">
                        <Link
                          href={category.href}
                          className="relative flex items-center overflow-hidden rounded-lg px-4 py-3 text-sm font-semibold text-[#0B1color] transition-all duration-300 hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A] group"
                        >
                          <span className="relative z-10">{category.name}</span>
                          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-transparent via-[#D6C6B2]/20 to-transparent" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Right Section - Search, User, Cart (Sin cambios) */}
            <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
              <div
                className="hidden items-center transition-all duration-300 ease-in-out md:flex"
                ref={searchRef}
              >
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform h-4 w-4 text-[#6B7280]" />
                    <Input
                      placeholder="Buscar productos..."
                      className={cn(
                        "rounded-xl border-[#E7E5E4] bg-white pl-10 pr-4 py-3 text-[#0B1220] placeholder:text-[#6B7280] focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:border-[#1E3A8A] shadow-sm",
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
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-[#E7E5E4] bg-white shadow-2xl backdrop-blur-sm">
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
                                  {suggestion.type === "product" &&
                                  suggestion.image ? (
                                    <div className="flex-shrink-0">
                                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-[#E7E5E4] shadow-sm">
                                        <Image
                                          src={
                                            suggestion.image ||
                                            "/placeholder.svg"
                                          }
                                          alt={suggestion.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex-shrink-0">
                                      {suggestion.type === "product" ? (
                                        <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#172C6F] shadow-sm transition-transform duration-200 group-hover:scale-110" />
                                      ) : (
                                        <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#8B1E3F] to-[#711732] shadow-sm transition-transform duration-200 group-hover:scale-110" />
                                      )}
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-[#0B1220] transition-colors duration-200 group-hover:text-[#1E3A8A]">
                                      {suggestion.name}
                                    </span>
                                    {suggestion.type === "product" &&
                                      suggestion.price !== undefined && (
                                        <span className="block text-xs font-semibold text-[#8B1E3F]">
                                          ${suggestion.price.toLocaleString()}
                                        </span>
                                      )}
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

                        {recentSearches.length > 0 &&
                          suggestions.length === 0 && (
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
              <div className="flex flex-shrink-0 items-center space-x-2 sm:space-x-3">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="rounded-xl p-1.5 sm:p-2 hover:bg-[#D6C6B2]/30 transition-all duration-200"
                      >
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-[#E7E5E4] shadow-sm">
                          <AvatarImage
                            src={
                              user.user_metadata?.avatar_url ||
                              "/placeholder.svg?height=36&width=36&query=user profile avatar" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={user.email || "User"}
                          />
                          <AvatarFallback className="bg-[#1E3A8A] text-white font-semibold text-sm">
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
                  className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl text-[#0B1220] hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A] transition-all duration-200"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-2 border-[#F8F7F4] p-0 bg-[#8B1E3F] text-white hover:bg-[#711732] text-[10px] sm:text-xs font-semibold shadow-lg"
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
                      className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl text-[#0B1220] hover:bg-[#D6C6B2]/30 hover:text-[#1E3A8A] lg:hidden transition-all duration-200"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[85vw] max-w-sm border-l-[#E7E5E4] bg-[#F8F7F4] p-0"
                  >
                    <div className="flex h-full flex-col">
                      {/* Mobile Menu Header */}
                      <div className="border-b border-[#E7E5E4] bg-white/50 px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#172C6F] shadow-md">
                            <span className="text-white text-lg font-bold">
                              S
                            </span>
                          </div>
                          <span className="text-[#0B1220] text-xl font-bold">
                            StyleHub
                          </span>
                        </div>
                      </div>

                      {/* Scrollable Content */}
                      <div className="flex-1 overflow-y-auto px-6 py-6">
                        <div className="flex flex-col space-y-6">
                          <div className="md:hidden" ref={mobileSearchRef}>
                            <form
                              onSubmit={handleMobileSearch}
                              className="relative"
                            >
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 transform h-4 w-4 text-[#6B7280] z-10" />
                              <Input
                                placeholder="Buscar productos..."
                                className="bg-white pl-11 pr-4 py-6 text-[#0B1220] placeholder:text-[#6B7280] border-[#E7E5E4] focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded-xl shadow-sm text-base"
                                value={mobileSearchQuery}
                                onChange={(e) =>
                                  setMobileSearchQuery(e.target.value)
                                }
                                onFocus={() => {
                                  if (
                                    mobileSearchQuery.length >= 2 ||
                                    recentSearches.length > 0
                                  ) {
                                    setShowMobileSuggestions(true);
                                  }
                                }}
                              />

                              {showMobileSuggestions && (
                                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-[#E7E5E4] bg-white shadow-2xl">
                                  {mobileSuggestions.length > 0 && (
                                    <div className="p-3">
                                      <div className="mb-2 flex items-center gap-2 px-2 py-1">
                                        <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#1E3A8A] to-[#8B1E3F]" />
                                        <span className="text-xs font-semibold uppercase tracking-wide text-[#0B1220]">
                                          Sugerencias
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        {mobileSuggestions.map(
                                          (suggestion, index) => (
                                            <button
                                              key={index}
                                              className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-all duration-200 hover:border-[#D6C6B2] hover:bg-[#D6C6B2]/20 active:scale-[0.98]"
                                              onClick={() =>
                                                handleMobileSuggestionClick(
                                                  suggestion
                                                )
                                              }
                                            >
                                              {suggestion.type === "product" &&
                                              suggestion.image ? (
                                                <div className="flex-shrink-0">
                                                  <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[#E7E5E4] shadow-sm">
                                                    <Image
                                                      src={
                                                        suggestion.image ||
                                                        "/placeholder.svg"
                                                      }
                                                      alt={suggestion.name}
                                                      fill
                                                      className="object-cover"
                                                    />
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="flex-shrink-0">
                                                  {suggestion.type ===
                                                  "product" ? (
                                                    <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#172C6F] shadow-sm" />
                                                  ) : (
                                                    <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#8B1E3F] to-[#711732] shadow-sm" />
                                                  )}
                                                </div>
                                              )}
                                              <div className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-[#0B1220]">
                                                  {suggestion.name}
                                                </span>
                                                {suggestion.type ===
                                                  "product" &&
                                                  suggestion.price !==
                                                    undefined && (
                                                    <span className="block text-xs font-semibold text-[#8B1E3F]">
                                                      $
                                                      {suggestion.price.toLocaleString()}
                                                    </span>
                                                  )}
                                              </div>
                                              <div className="flex-shrink-0">
                                                <span className="rounded-full px-2 py-0.5 text-xs font-medium text-[#6B7280] bg-[#F8F7F4]">
                                                  {suggestion.type === "product"
                                                    ? "Producto"
                                                    : "Categoría"}
                                                </span>
                                              </div>
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {recentSearches.length > 0 &&
                                    mobileSuggestions.length === 0 && (
                                      <div className="border-t border-[#E7E5E4] bg-gradient-to-b from-[#F8F7F4]/30 to-[#F8F7F4]/10">
                                        <div className="p-3">
                                          <div className="mb-2 flex items-center gap-2 px-2 py-1">
                                            <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#6B7280] to-[#D6C6B2]" />
                                            <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                                              Búsquedas recientes
                                            </span>
                                          </div>
                                          <div className="space-y-1">
                                            {recentSearches.map(
                                              (search, index) => (
                                                <button
                                                  key={index}
                                                  className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all duration-200 hover:border-[#E7E5E4] hover:bg-white/60 active:scale-[0.98]"
                                                  onClick={() => {
                                                    setMobileSearchQuery(
                                                      search
                                                    );
                                                    setShowMobileSuggestions(
                                                      false
                                                    );
                                                    router.push(
                                                      `/productos?search=${encodeURIComponent(search)}`
                                                    );
                                                  }}
                                                >
                                                  <div className="flex-shrink-0">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#F8F7F4] to-[#D6C6B2] shadow-sm">
                                                      <Search className="h-3 w-3 text-[#6B7280]" />
                                                    </div>
                                                  </div>
                                                  <div className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium text-[#0B1220]">
                                                      {search}
                                                    </span>
                                                  </div>
                                                </button>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  {mobileSuggestions.length === 0 &&
                                    recentSearches.length === 0 &&
                                    mobileSearchQuery.length >= 2 && (
                                      <div className="p-6 text-center">
                                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#F8F7F4] to-[#D6C6B2] shadow-sm">
                                          <Search className="h-4 w-4 text-[#6B7280]" />
                                        </div>
                                        <p className="mb-1 text-sm font-medium text-[#6B7280]">
                                          No se encontraron sugerencias
                                        </p>
                                        <p className="text-xs text-[#6B7280]">
                                          Intenta con otros términos
                                        </p>
                                      </div>
                                    )}
                                </div>
                              )}
                            </form>
                          </div>

                          <div className="space-y-5">
                            <div className="flex items-center gap-2 px-1">
                              <div className="h-5 w-1 rounded-full bg-gradient-to-b from-[#1E3A8A] to-[#8B1E3F]" />
                              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                                Categorías
                              </span>
                            </div>
                            <Accordion
                              type="single"
                              collapsible
                              className="space-y-2"
                            >
                              {categories.map((category) =>
                                // --- Lógica condicional para el menú móvil ---
                                category.subcategories &&
                                category.subcategories.length > 0 ? (
                                  <AccordionItem
                                    key={category.name}
                                    value={category.name}
                                    className="border-none"
                                  >
                                    <AccordionTrigger className="flex items-center justify-between rounded-lg bg-white/60 px-4 py-3.5 text-base font-bold text-[#0B1220] hover:bg-white hover:text-[#1E3A8A] hover:no-underline transition-all duration-200 shadow-sm [&[data-state=open]]:bg-white [&[data-state=open]]:text-[#1E3A8A]">
                                      {category.name}
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 pb-0">
                                      <div className="space-y-1 pl-3">
                                        {category.subcategories.map((sub) => (
                                          <Link
                                            key={sub.name}
                                            href={sub.href}
                                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#6B7280] hover:bg-[#D6C6B2]/20 hover:text-[#0B1220] transition-all duration-200 active:scale-[0.98]"
                                          >
                                            <div className="h-1.5 w-1.5 rounded-full bg-[#D6C6B2]" />
                                            {sub.name}
                                          </Link>
                                        ))}
                                        <Link
                                          href={category.href}
                                          className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-[#8B1E3F] hover:bg-[#8B1E3F]/10 hover:text-[#711732] transition-all duration-200 active:scale-[0.98] mt-2"
                                        >
                                          <span>Ver toda la colección</span>
                                          <ChevronDown className="h-3 w-3 -rotate-90" />
                                        </Link>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ) : (
                                  // Renderiza un enlace simple si no hay subcategorías
                                  <Link
                                    key={category.name}
                                    href={category.href}
                                    className="flex items-center justify-between rounded-lg bg-white/60 px-4 py-3.5 text-base font-bold text-[#0B1220] hover:bg-white hover:text-[#1E3A8A] hover:no-underline transition-all duration-200 shadow-sm"
                                  >
                                    {category.name}
                                  </Link>
                                )
                              )}
                            </Accordion>
                          </div>
                        </div>
                      </div>

                      {/* Mobile User Actions - Fixed at bottom */}
                      <div className="border-t border-[#E7E5E4] bg-white/50 px-6 py-5">
                        <div className="space-y-3">
                          {user ? (
                            <>
                              {isAdmin && (
                                <Button
                                  className="w-full bg-[#8B1E3F] hover:bg-[#711732] text-white font-semibold rounded-xl py-6 transition-all duration-200 shadow-md active:scale-[0.98] text-base"
                                  onClick={() =>
                                    router.push("/admin/dashboard")
                                  }
                                >
                                  <Settings className="mr-2 h-5 w-5" />
                                  Panel Admin
                                </Button>
                              )}
                              <Button
                                className="w-full bg-[#1E3A8A] hover:bg-[#172C6F] text-white font-semibold rounded-xl py-6 transition-all duration-200 shadow-md active:scale-[0.98] text-base"
                                onClick={() => router.push("/profile")}
                              >
                                <User className="mr-2 h-5 w-5" />
                                Mi Perfil
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full border-2 border-[#8B1E3F] text-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white font-semibold rounded-xl py-6 transition-all duration-200 bg-transparent active:scale-[0.98] text-base"
                                onClick={handleLogout}
                              >
                                <LogOut className="mr-2 h-5 w-5" />
                                Cerrar Sesión
                              </Button>
                            </>
                          ) : (
                            <Button
                              className="w-full bg-[#1E3A8A] hover:bg-[#172C6F] text-white font-semibold rounded-xl py-6 transition-all duration-200 shadow-md active:scale-[0.98] text-base"
                              onClick={() => router.push("/register")}
                            >
                              <User className="mr-2 h-5 w-5" />
                              Registrarse
                            </Button>
                          )}
                        </div>
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