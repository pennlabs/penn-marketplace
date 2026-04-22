import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "./UserProfileDropdown";

interface Props {
  createNewConfig: { text: string; href: string } | undefined;
  mobileShowHamburger: boolean;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const NavbarActions = ({
  createNewConfig,
  mobileShowHamburger,
  isMobileMenuOpen,
  onToggleMobileMenu,
}: Props) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNotificationClick = () => {
    // TODO
    setHasUnreadNotifications(false);
  };

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isDropdownOpen]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {createNewConfig && (
        <>
          {/* desktop only new listing button */}
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground hidden gap-2 md:flex"
            asChild
          >
            <Link href={createNewConfig.href} aria-label={createNewConfig.text}>
              <Plus className="h-4 w-4" />
              <span>{createNewConfig.text}</span>
            </Link>
          </Button>

          {/* mobile only new listing button (icon only) */}
          <Button
            variant="outline"
            size="icon"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground md:hidden"
            asChild
          >
            <Link href={createNewConfig.href} aria-label={createNewConfig.text}>
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </>
      )}

      {/* notification bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative cursor-pointer"
        onClick={handleNotificationClick}
        aria-label={`Notifications${hasUnreadNotifications ? " (unread)" : ""}`}
      >
        <Bell className="h-5 w-5" />
        {hasUnreadNotifications && (
          <span
            className="bg-primary absolute top-1 right-1 h-2 w-2 rounded-full"
            aria-hidden="true"
          />
        )}
      </Button>

      {/* user avatar */}
      <div className="relative" ref={containerRef}>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer overflow-hidden rounded-full p-0 transition-opacity hover:opacity-80"
          onClick={handleAvatarClick}
          aria-label="User menu"
          aria-expanded={isDropdownOpen}
        >
          <Image
            src="/images/default-avatar.png"
            alt="User avatar"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        </Button>

        <UserProfileDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
      </div>

      {/* mobile only menu toggle */}
      {mobileShowHamburger && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}
    </div>
  );
};
