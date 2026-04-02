"use client";

import { useState, useMemo } from "react";
import { SearchInput } from "@/components/filters/SearchInput";
import { ListingsCard } from "@/components/listings/ListingsCard";
import { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TABS = ["All Listings", "Active Listings", "Completed"] as const;
type Tab = (typeof TABS)[number];

interface Props {
  listings: Listing[];
}

function isActive(listing: Listing): boolean {
  if (!listing.expires_at) return true;
  return new Date(listing.expires_at) > new Date();
}

export const MyListingsContent = ({ listings }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("All Listings");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    listings.forEach((l) => {
      if (l.listing_type === "item") cats.add(l.additional_data.category);
      if (l.listing_type === "sublet") cats.add("Sublet");
    });
    return Array.from(cats).sort();
  }, [listings]);

  const filtered = useMemo(() => {
    let result = listings;

    if (activeTab === "Active Listings") {
      result = result.filter(isActive);
    } else if (activeTab === "Completed") {
      result = result.filter((l) => !isActive(l));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((l) => l.title.toLowerCase().includes(q));
    }

    if (category !== "all") {
      result = result.filter((l) => {
        if (category === "Sublet") return l.listing_type === "sublet";
        return l.listing_type === "item" && l.additional_data.category === category;
      });
    }

    return result;
  }, [listings, activeTab, search, category]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-1 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "text-brand border-brand border-b-2"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search Listings" value={search} onChange={setSearch} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No listings found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((listing) => (
            <ListingsCard
              key={listing.id}
              listing={listing}
              previewImageUrl={listing.images[0]}
              href={`/${listing.listing_type === "item" ? "items" : "sublets"}/${listing.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
