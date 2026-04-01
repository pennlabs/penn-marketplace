import Link from "next/link";
import { ShoppingBag, Bookmark } from "lucide-react";
import { ListingsCard } from "@/components/listings/ListingsCard";
import { Listing } from "@/lib/types";

interface Props {
  title: string;
  count: number;
  listings: Listing[];
  seeAllHref: string;
  icon: "listings" | "saved";
}

export const ListingSection = ({ title, count, listings, seeAllHref, icon }: Props) => {
  const Icon = icon === "listings" ? ShoppingBag : Bookmark;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h2 className="text-lg font-bold">
            {title} ({count})
          </h2>
        </div>
        <Link href={seeAllHref} className="text-brand text-sm font-medium hover:underline">
          See All {title}
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="text-sm text-gray-500">No {title.toLowerCase()} yet.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {listings.map((listing) => (
            <div key={listing.id} className="w-48 flex-shrink-0">
              <ListingsCard
                listing={listing}
                previewImageUrl={listing.images[0]}
                href={`/${listing.listing_type === "item" ? "items" : "sublets"}/${listing.id}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
