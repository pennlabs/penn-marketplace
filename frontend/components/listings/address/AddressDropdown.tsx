import { Loader2 } from "lucide-react";
import type { AddressResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddressDropdownProps {
  suggestions: AddressResult[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  onSelect: (address: AddressResult) => void;
  highlightedIndex: number;
}

export function AddressDropdown({
  suggestions,
  isLoading,
  error,
  isOpen,
  onSelect,
  highlightedIndex,
}: AddressDropdownProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute top-full right-0 left-0 z-50 mt-1",
        "bg-popover max-h-[300px] overflow-y-auto rounded-md border shadow-md",
        "animate-in fade-in-0 zoom-in-95"
      )}
      role={"listbox"}
    >
      {isLoading && (
        <div className={"text-muted-foreground flex items-center justify-center gap-2 p-4 text-sm"}>
          <Loader2 className={"size-4 animate-spin"} />
          <span>Searching addresses...</span>
        </div>
      )}

      {!isLoading && error && <div className={"text-destructive p-4 text-sm"}>{error}</div>}

      {!isLoading && !error && suggestions.length === 0 && (
        <div className={"text-muted-foreground p-4 text-sm"}>
          Start typing to search addresses...
        </div>
      )}

      {!isLoading && !error && suggestions.length > 0 && (
        <div className={"p-1"}>
          {suggestions.map((address, index) => (
            <div
              key={address.placeId}
              role="option"
              aria-selected={index === highlightedIndex}
              className={cn(
                "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none",
                "hover:bg-accent hover:text-accent-foreground",
                index === highlightedIndex && "bg-accent text-accent-foreground"
              )}
              onClick={() => onSelect(address)}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              <span className={"truncate"}>{address.displayName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
