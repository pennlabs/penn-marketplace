import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  createNewText: string;
  createNewHref: string;
  mobileShowHamburger: boolean;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const NavbarActions = ({
  createNewText,
  createNewHref,
  mobileShowHamburger,
  isMobileMenuOpen,
  onToggleMobileMenu,
}: Props) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const handleNotificationClick = () => {
    // TODO
    setHasUnreadNotifications(false);
  };

  const handleAvatarClick = () => {
    // TODO
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* desktop only new listing button */}
      {<Button
          variant="outline"
          className="hidden md:flex gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          asChild
        >
          <Link href={createNewHref} aria-label={createNewText}>
            <Plus className="w-4 h-4" />
            <span>{createNewText}</span>
          </Link>
        </Button>
      }

      {/* mobile only new listing button (icon only) */}
      {<Button
          variant="outline"
          size="icon"
          className="md:hidden border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          asChild
        >
          <Link href={createNewHref} aria-label={createNewText}>
            <Plus className="w-4 h-4" />
          </Link>
        </Button>
      }

      {/* notification bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
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
      <Button
        variant="ghost"
        size="icon"
        className="overflow-hidden rounded-full p-0 transition-opacity hover:opacity-80"
        onClick={handleAvatarClick}
        aria-label="User menu"
      >
        <Image
          src="/images/default-avatar.png"
          alt="User avatar"
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </Button>

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
