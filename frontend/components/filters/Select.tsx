"use client";

import {
  Select as SelectShadcn,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// item value can't be empty so use __all__ instead
const ALL_VALUE = "__all__";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  label?: string;
  triggerClassName?: string;
}

export const Select = ({
  value,
  onValueChange,
  options,
  placeholder,
  label,
  triggerClassName,
}: Props) => {
  const selectValue = value || ALL_VALUE;

  const handleValueChange = (newValue: string) => {
    onValueChange(newValue === ALL_VALUE ? "" : newValue);
  };

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm whitespace-nowrap text-gray-600">{label}</span>}
      <div className="w-full">
        <SelectShadcn value={selectValue} onValueChange={handleValueChange}>
          <SelectTrigger
            // height forced to h-10 to override shadcn default
            className={cn(
              "focus-visible:border-input bg-background !h-10 w-[180px] focus-visible:ring-0 focus-visible:ring-offset-0",
              triggerClassName
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>{placeholder}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectShadcn>
      </div>
    </div>
  );
};
