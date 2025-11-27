import { useState } from "react";
import Image from "next/image";
import { Bell, Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  createNewText: string;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const NavbarActions = ({
  createNewText,
  isMobileMenuOpen,
  onToggleMobileMenu,
}: Props) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const handleCreateNew = () => {
    // TODO: Implement create new listing modal/navigation
    console.log("Create new:", createNewText);
  };

  const handleNotificationClick = () => {
    // TODO: Implement notification panel/dropdown
    console.log("Notifications clicked");
  };

  const handleAvatarClick = () => {
    // TODO: Implement user menu/profile dropdown
    console.log("Avatar clicked");
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Desktop new listing button */}
      <Button
        variant="outline"
        className="hidden md:flex gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        onClick={handleCreateNew}
        aria-label={createNewText}
      >
        <Plus className="w-4 h-4" />
        <span>{createNewText}</span>
      </Button>

      {/* Mobile new listing button (icon only) */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        onClick={handleCreateNew}
        aria-label={createNewText}
      >
        <Plus className="w-4 h-4" />
      </Button>

      {/* Notification bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleNotificationClick}
        aria-label={`Notifications${hasUnreadNotifications ? " (unread)" : ""}`}
      >
        <Bell className="w-5 h-5" />
        {hasUnreadNotifications && (
          <span
            className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"
            aria-hidden="true"
          />
        )}
      </Button>

      {/* User avatar */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full p-0 overflow-hidden hover:opacity-80 transition-opacity"
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

      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onToggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
};
