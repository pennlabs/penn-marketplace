import { useState } from "react";
import Image from "next/image";
import { Bell, Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname , useRouter} from "next/navigation";

interface Props {
  createNewText?: string;
  mobileShowHamburger: boolean;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const NavbarActions = ({
  createNewText,
  mobileShowHamburger,
  isMobileMenuOpen,
  onToggleMobileMenu,
}: Props) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const pathName = usePathname();
  const router = useRouter();

  const handleCreateNew = () => {
    if (pathName.startsWith("/sublet")) {
      router.push("/create/sublet");
    } else {
      router.push("/create/item");
    }
  };

  const handleNotificationClick = () => {
    // TODO
  };

  const handleAvatarClick = () => {
    // TODO
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* desktop only new listing button */}
      {createNewText && (
        <Button
          variant="outline"
          className="hidden md:flex gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={handleCreateNew}
          aria-label={createNewText}
        >
          <Plus className="w-4 h-4" />
          <span>{createNewText}</span>
        </Button>
      )}

      {/* mobile only new listing button (icon only) */}
      {createNewText && (
        <Button
          variant="outline"
          size="icon"
          className="md:hidden border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={handleCreateNew}
          aria-label={createNewText}
        >
          <Plus className="w-4 h-4" />
        </Button>
      )}

      {/* notification bell */}
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

      {/* user avatar */}
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
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      )}
    </div>
  );
};
