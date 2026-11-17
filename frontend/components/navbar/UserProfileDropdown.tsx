"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { UserCircle, ClipboardList, Heart, LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";

interface UserProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

type MenuLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function UserProfileDropdown({ isOpen, onClose }: UserProfileDropdownProps) {
  // fetched while the menu is closed too, so the profile link is ready when it opens
  const { data: currentUser } = useQuery({
    queryKey: queryKeys.currentUser(),
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });

  if (!isOpen) return null;

  const links: MenuLink[] = [
    ...(currentUser
      ? [{ href: `/profile/${currentUser.id}`, label: "My Profile", icon: UserCircle }]
      : []),
    { href: "/my-listings", label: "My Listings", icon: ClipboardList },
    { href: "/favorites", label: "Favorites", icon: Heart },
  ];

  return (
    <div
      className={cn(
        "absolute top-full right-0 z-50 mt-1 min-w-[200px]",
        "bg-popover rounded-md border shadow-md",
        "animate-in fade-in-0 zoom-in-95"
      )}
      role="menu"
    >
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-3 text-sm first:rounded-t-md",
            "hover:bg-accent hover:text-accent-foreground transition-colors"
          )}
          role="menuitem"
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
}
