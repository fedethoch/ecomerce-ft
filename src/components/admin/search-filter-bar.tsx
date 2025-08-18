"use client";

import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFilterBarProps {
  placeholder: string;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
}

export function SearchFilterBar({
  placeholder,
  onSearch,
  onFilter,
}: SearchFilterBarProps) {
  return (
    <div className="flex items-center space-x-2 w-full">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-8"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <Button variant="outline" onClick={onFilter}>
        <Filter className="h-4 w-4 mr-2" />
        Filtros
      </Button>
    </div>
  );
}
