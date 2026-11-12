import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Active", href: "/my-listings", expired: false },
  { label: "Expired", href: "/my-listings?tab=expired", expired: true },
];

interface Props {
  expired: boolean;
}

export const MyListingsTabs = ({ expired }: Props) => {
  return (
    <div className="bg-muted inline-flex items-center gap-1 rounded-lg p-1">
      {TABS.map((tab) => {
        const isActive = tab.expired === expired;

        return (
          <Link
            key={tab.label}
            href={tab.href}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};
