import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatCondition, formatDate } from "@/lib/utils";
import { Item, Sublet } from "@/lib/types";
import defaultImage from "@/public/images/default-image.jpg";

interface Props {
  listing: Item | Sublet;
  previewImageUrl?: string;
  href: string;
  isMyListing?: boolean;
}

function getBadgeContent(listing: Item | Sublet): string {
  switch (listing.listing_type) {
    case "item":
      return formatCondition(listing.additional_data.condition);
    case "sublet":
      const { beds, baths } = listing.additional_data;
      const bedText = beds === 0 ? "Studio" : `${beds} bed${beds > 1 ? "s" : ""}`;
      const bathText = `${baths} bath${baths > 1 ? "s" : ""}`;
      return `${bedText} • ${bathText}`;
    default:
      return "";
  }
}

/**
 * returns metadata content to display below price
 * - items: shows category (e.g., "Electronics", "Furniture")
 * - sublets: shows date range with calendar icon (e.g., "Jan 1 - Jun 30")
 */
function getMetadataContent(listing: Item | Sublet): React.ReactNode {
  switch (listing.listing_type) {
    case "item":
      return <div className="line-clamp-1">{listing.additional_data.category}</div>;
    case "sublet":
      return (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {formatDate(listing.additional_data.start_date)} - {formatDate(listing.additional_data.end_date)}
          </span>
        </div>
      );
    default:
      return null;
  }
}

export const ListingsCard = ({
  listing,
  previewImageUrl,
  href,
  isMyListing = false,
}: Props) => {
  const showMonthlyPrice = listing.listing_type === "sublet";

  return (
    <Link
      href={href}
      className="group w-full border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 bg-white"
    >
      {/* image container */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        <Image
          src={previewImageUrl || defaultImage}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />

        {/* badges overlay */}
        {isMyListing && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-brand hover:bg-brand-hover text-white border-none shadow-sm">
              My Listing
            </Badge>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-none shadow-sm hover:bg-white">
            {getBadgeContent(listing)}
          </Badge>
        </div>
      </div>

      {/* content (title, price, metadata) */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-semibold text-sm leading-tight line-clamp-1">
            {listing.title}
          </h2>

          <p className="font-bold text-base">
            <span className="text-brand">{formatPrice(listing.price, false)}</span>
            {showMonthlyPrice && <span className="text-xs text-black font-normal">/mo</span>}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-col gap-1 text-xs text-gray-600 h-[20px]">
          {getMetadataContent(listing)}
        </div>
      </div>
    </Link>
  );
};