import type { NominatimAddress } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddressOptionProps {
  address: NominatimAddress;
  isHighlighted: boolean;
  onClick: () => void;
}

export function AddressOption({ address, isHighlighted, onClick }: AddressOptionProps) {
  return (
    <div
      role="option"
      aria-selected={isHighlighted}
      className={cn(
        "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none",
        "hover:bg-accent hover:text-accent-foreground",
        isHighlighted && "bg-accent text-accent-foreground"
      )}
      onClick={onClick}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      <span className={"truncate"}>{address.display_name}</span>
    </div>
  );
}
