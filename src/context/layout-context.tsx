"use client";

import { useIsMobile } from "@/components/ui/use-mobile";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AdminLayoutContextType {
  open: boolean;
  toggle: () => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(
  undefined
);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const toggle = () => setOpen((prev) => !prev);

  return (
    <AdminLayoutContext.Provider value={{ open, toggle }}>
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (context === undefined) {
    throw new Error(
      "useAdminLayout must be used within an AdminLayoutProvider"
    );
  }
  return context;
}
