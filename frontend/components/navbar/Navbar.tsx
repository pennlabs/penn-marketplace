"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/navbar/Logo";
import { NavbarActions } from "@/components/navbar/NavbarActions";
import { NavTabs } from "@/components/navbar/NavTabs";
import { cn } from "@/lib/utils";

const ALL_LISTINGS_PAGES = ["/", "/items", "/sublets"] as const;

type AllListingsPagePath = (typeof ALL_LISTINGS_PAGES)[number];

const ALL_LISTINGS_PAGES_CREATE_NEW_TEXT: Record<AllListingsPagePath, string> = {
  "/": "New Item",
  "/items": "New Item",
  "/sublets": "New Sublet",
} as const;

const isAllListingsPage = (path: string): path is AllListingsPagePath => {
  return ALL_LISTINGS_PAGES.includes(path as AllListingsPagePath);
};

export const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showListingsTabs = isAllListingsPage(pathname);
  const createNewText = showListingsTabs ? ALL_LISTINGS_PAGES_CREATE_NEW_TEXT[pathname] : undefined;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 z-50 w-full" role="navigation" aria-label="Main navigation">
      <div className="relative z-50 border-b bg-gray-50 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-gray-50/95">
        <div className="flex flex-col py-3">
          {/* top row */}
          <div className="mx-auto flex h-10 w-full max-w-[96rem] items-center justify-between gap-4 px-4 sm:px-12">
            <Logo onLogoClick={closeMobileMenu} />

            {/* desktop only tabs */}
            {showListingsTabs && (
              <div className="hidden md:block">
                <NavTabs variant="desktop" />
              </div>
            )}

            <NavbarActions
              createNewText={createNewText}
              mobileShowHamburger={showListingsTabs}
              isMobileMenuOpen={isMobileMenuOpen}
              onToggleMobileMenu={toggleMobileMenu}
            />
          </div>
        </div>
      </div>

      {/* mobile only menu */}
      <div
        id="mobile-menu"
        className={cn(
          "bg-background fixed inset-x-0 border-b shadow-lg transition-all duration-300 ease-in-out md:hidden",
          isMobileMenuOpen
            ? "z-40 translate-y-0 opacity-100"
            : "pointer-events-none z-30 -translate-y-full opacity-0"
        )}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="mx-auto flex max-w-[96rem] flex-col">
          {/* mobile only tabs */}
          <NavTabs variant="mobile" onLinkClick={closeMobileMenu} />
        </div>
      </div>
    </nav>
  );
};
