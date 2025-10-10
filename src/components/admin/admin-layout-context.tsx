"use client";

import { useAdminLayout } from "@/context/layout-context";
import type { ReactNode } from "react";

interface AdminLayoutContentProps {
  children: ReactNode;
}

export function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  const { open } = useAdminLayout();

  return (
    <main className="flex-1 overflow-auto">
      <div
        className={`
        min-h-full transition-all duration-300 ease-in-out
        pt-16 px-4 pb-4 
        md:pt-4 md:px-8 
        ${open ? "md:pl-[272px]" : "md:pl-[80px]"}
      `}
      >
        {children}
      </div>
    </main>
  );
}
