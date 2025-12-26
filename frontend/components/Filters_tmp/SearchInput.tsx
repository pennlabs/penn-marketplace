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
    <div className="relative flex-1 min-w-[180px]">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-4 z-10 pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-11 h-10 w-full text-sm bg-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
      />
    </div>
  );
};