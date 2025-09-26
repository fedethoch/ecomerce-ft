"use client";

import type { ReactNode } from "react";

interface AdminLayoutContentProps {
  children: ReactNode;
}

export function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  return (
    <main className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
      <div className="p-6 h-full">{children}</div>
    </main>
  );
}
