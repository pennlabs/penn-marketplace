import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Home, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS_PATH = ["/items", "/"];
const SUBLETS_PATH = ["/sublets"];

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  activePaths: string[];
};

const NAV_LINKS: NavLink[] = [
  {
    href: "/items",
    label: "Items",
    icon: ShoppingBag,
    activePaths: ITEMS_PATH,
  },
  {
    href: "/sublets",
    label: "Sublet",
    icon: Home,
    activePaths: SUBLETS_PATH,
  },
];

const VARIANT_STYLES = {
  mobile: {
    container: "flex flex-col gap-2",
    containerProps: { role: "navigation", "aria-label": "Mobile navigation" },
    link: "flex items-center gap-2 px-4 py-3 rounded-md transition-colors text-sm font-medium",
    active: "bg-muted text-foreground",
    inactive: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
  },
  desktop: {
    container: "flex items-center gap-1 bg-muted rounded-lg p-1",
    containerProps: {},
    link: "flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium",
    active: "bg-background text-foreground shadow-sm",
    inactive: "text-muted-foreground hover:text-foreground hover:bg-background/50",
  },
} as const;

interface Props {
  variant?: "desktop" | "mobile";
  onLinkClick?: () => void;
}

export const NavTabs = ({ variant = "desktop", onLinkClick }: Props = {}) => {
  const pathname = usePathname();
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={styles.container} {...styles.containerProps}>
      {NAV_LINKS.map(({ href, label, icon: Icon, activePaths }) => {
        const isActive = activePaths.includes(pathname);

        return (
          <Link
            key={href}
            href={href}
            onClick={onLinkClick}
            className={cn(styles.link, isActive ? styles.active : styles.inactive)}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
};
