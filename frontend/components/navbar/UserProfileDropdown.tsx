"use client";

import Link from "next/link";
import { UserCircle, ClipboardList, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

// TODO update hrefs once user pages are created
export function UserProfileDropdown({ isOpen, onClose }: UserProfileDropdownProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute top-full right-0 z-50 mt-1 min-w-[200px]",
        "bg-popover rounded-md border shadow-md",
        "animate-in fade-in-0 zoom-in-95"
      )}
      role="menu"
    >
      <Link
        href="/profile"
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 rounded-t-md px-3 py-3 text-sm",
          "hover:bg-accent hover:text-accent-foreground transition-colors"
        )}
        role="menuitem"
      >
        <UserCircle className="h-5 w-5" />
        <span>My Profile</span>
      </Link>

      <div className="text-foreground mt-1 px-3 py-1 text-xs font-bold">Selling</div>
      <Link
        href="/profile/listings"
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 px-3 py-3 text-sm",
          "hover:bg-accent hover:text-accent-foreground transition-colors"
        )}
        role="menuitem"
      >
        <ClipboardList className="h-5 w-5" />
        <span>My Listings</span>
      </Link>

      <div className="text-foreground mt-1 px-3 py-1 text-xs font-bold">Buying</div>
      <Link
        href="/"
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 px-3 py-3 text-sm",
          "hover:bg-accent hover:text-accent-foreground transition-colors"
        )}
        role="menuitem"
      >
        <Bookmark className="h-5 w-5" />
        <span>Saved Listings</span>
      </Link>

      <Link
        href="/"
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 rounded-b-md px-3 py-3 text-sm",
          "hover:bg-accent hover:text-accent-foreground transition-colors"
        )}
        role="menuitem"
      >
        <ClipboardList className="h-5 w-5" />
        <span>My Purchases</span>
      </Link>
    </div>
  );
}
