"use client";

import { X } from "lucide-react";
import {
  Select as SelectShadcn,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  label?: string;
  allowClear?: boolean;
  triggerClassName?: string;
}

export const Select = ({
  value,
  onValueChange,
  options,
  placeholder,
  label,
  allowClear = true,
  triggerClassName
}: Props) => {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-gray-600 whitespace-nowrap">{label}</span>}
      <div className="relative w-full">
        <SelectShadcn value={value} onValueChange={onValueChange}>
          <SelectTrigger
            className={cn(
              "w-[180px] h-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input bg-background",
              triggerClassName
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectShadcn>
        {allowClear && value && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onValueChange("");
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}