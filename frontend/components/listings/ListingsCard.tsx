import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { Item, Sublet } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import defaultImage from "@/public/images/default-image.jpg";

interface Props {
  listing: Item | Sublet;
  previewImageUrl?: string;
  href: string;
}

const LISTING_METADATA = {
  item: (listing: Item) => [
    listing.additional_data.category,
    listing.additional_data.condition,
  ],
  sublet: (listing: Sublet) => [
    `${listing.additional_data.beds} bed`,
    `${listing.additional_data.baths} bath`,
  ],
} as const;

function getMetadataItems(listing: Item | Sublet): string[] {
  switch (listing.listing_type) {
    case "item":
      return LISTING_METADATA.item(listing);
    case "sublet":
      return LISTING_METADATA.sublet(listing);
    default:
      return [];
  }
}

export const ListingsCard = ({
  listing,
  previewImageUrl,
  href,
}: Props) => {
  const showMonthlyPrice = listing.listing_type === "sublet";
  const metadataItems = getMetadataItems(listing);

  return (
    <Link href={href} className="w-full border rounded-md overflow-hidden flex flex-col hover:shadow-md transition-shadow bg-white">
      <div className="relative w-full aspect-square overflow-hidden">
        <Image
          src={previewImageUrl || defaultImage}
          alt={listing.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-2 min-h-[120px]">
        <div className="flex items-center gap-1 text-xs text-gray-500 min-h-[16px] flex-wrap">
          {metadataItems.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && <span className="flex-shrink-0">•</span>}
              <span>{item}</span>
            </Fragment>
          ))}
        </div>
        <h2 className="font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem]">
          {listing.title}
        </h2>
        <p className="font-bold text-lg mt-auto">{formatPrice(listing.price, showMonthlyPrice)}</p>
      </div>
    </Link>
  );
};