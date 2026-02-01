"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  inputClassName?: string;
}

export const PriceRangeInput = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  inputClassName,
}: Props) => {
  // format number with commas for display
  const formatNumber = (value: string): string => {
    if (!value) return "";

    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    return parseInt(numericValue, 10).toLocaleString("en-US");
  };

  const formattedMinValue = formatNumber(minValue);
  const formattedMaxValue = formatNumber(maxValue);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        {formattedMinValue && (
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform">
            $
          </span>
        )}
        <Input
          type="text"
          inputMode="numeric"
          value={formattedMinValue}
          onChange={(e) => onMinChange(e.target.value.replace(/\D/g, ""))}
          placeholder="Min $"
          className={cn(
            "focus-visible:border-input bg-background h-10 w-24 text-sm focus-visible:ring-0 focus-visible:ring-offset-0",
            formattedMinValue && "pl-7",
            inputClassName
          )}
        />
      </div>
      <span className="text-gray-400">—</span>
      <div className="relative flex-1">
        {formattedMaxValue && (
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform">
            $
          </span>
        )}
        <Input
          type="text"
          inputMode="numeric"
          value={formattedMaxValue}
          onChange={(e) => onMaxChange(e.target.value.replace(/\D/g, ""))}
          placeholder="Max $"
          className={cn(
            "focus-visible:border-input bg-background h-10 w-24 text-sm focus-visible:ring-0 focus-visible:ring-offset-0",
            formattedMaxValue && "pl-7",
            inputClassName
          )}
        />
      </div>
    </div>
  );
};
