"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Logo } from "@/components/Navbar/Logo";
import { NavbarActions } from "@/components/Navbar/NavbarActions";
import { NavTabs } from "@/components/Navbar/NavTabs";
import { SearchBar } from "@/components/Navbar/SearchBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const CREATE_NEW_TEXT = {
  "/": "New Item",
  "/items": "New Item",
  "/sublets": "New Sublet",
} as const;

export const isValidPathname = (path: string): path is keyof typeof CREATE_NEW_TEXT => {
  return path in CREATE_NEW_TEXT;
};

export const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const createNewText = isValidPathname(pathname)
    ? CREATE_NEW_TEXT[pathname]
    : "New Listing";

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleCreateNew = () => {
    // TODO
  };

  return (
    <nav className="fixed top-0 z-50 w-full" role="navigation" aria-label="Main navigation">
      <div className="border-b bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 shadow-xs relative z-50">
        <div className="flex flex-col py-6 md:space-y-6 space-y-0">
          {/* top row */}
          <div className="flex items-center justify-between gap-4 w-full max-w-[96rem] mx-auto px-4 sm:px-12">
            <Logo onLogoClick={closeMobileMenu} />

            {/* desktop only tabs */}
            <div className="hidden md:block">
              <NavTabs variant="desktop" />
            </div>

            <NavbarActions
              createNewText={createNewText}
              isMobileMenuOpen={isMobileMenuOpen}
              onToggleMobileMenu={toggleMobileMenu}
            />
          </div>

          {/* desktop only search bar */}
          <div className="hidden md:flex justify-center w-full max-w-[96rem] mx-auto px-4 pb-2">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* mobile only menu */}
      <div
        id="mobile-menu"
        className={cn(
          "md:hidden fixed inset-x-0 bg-background border-b shadow-lg transition-all duration-300 ease-in-out",
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 z-40"
            : "opacity-0 -translate-y-full pointer-events-none z-30"
        )}
        style={{
          top: "var(--navbar-height, 88px)",
        }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col p-4 space-y-4 max-w-[96rem] mx-auto">
          {/* mobile only search bar */}
          <div className="pb-4 border-b">
            <SearchBar />
          </div>

          {/* mobile only tabs */}
          <NavTabs variant="mobile" onLinkClick={closeMobileMenu} />

          {/* mobile only create button */}
          <Button
            variant="outline"
            className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handleCreateNew}
          >
            <Plus className="w-4 h-4" />
            <span>{createNewText}</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
