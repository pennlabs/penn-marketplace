"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Navbar/Logo";
import { NavbarActions } from "@/components/Navbar/NavbarActions";
import { NavTabs } from "@/components/Navbar/NavTabs";
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
  const createNewText = showListingsTabs
    ? ALL_LISTINGS_PAGES_CREATE_NEW_TEXT[pathname]
    : undefined;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 z-50 w-full" role="navigation" aria-label="Main navigation">
      <div className="border-b bg-gray-50 backdrop-blur supports-[backdrop-filter]:bg-gray-50/95 shadow-xs relative z-50">
        <div className="flex flex-col py-3">
          {/* top row */}
          <div className="flex items-center justify-between gap-4 h-10 w-full max-w-[96rem] mx-auto px-4 sm:px-12">
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
          "md:hidden fixed inset-x-0 bg-background border-b shadow-lg transition-all duration-300 ease-in-out",
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 z-40"
            : "opacity-0 -translate-y-full pointer-events-none z-30"
        )}

        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col max-w-[96rem] mx-auto">
          {/* mobile only tabs */}
          <NavTabs variant="mobile" onLinkClick={closeMobileMenu} />
        </div>
      </div>
    </nav>
  );
};
