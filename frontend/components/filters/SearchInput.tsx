"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ placeholder, value, onChange }: Props) => {
  return (
    <div className="relative min-w-[180px] flex-1">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 z-10 h-4 w-5 -translate-y-1/2 transform" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background focus-visible:border-input h-10 w-full pl-11 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
};
