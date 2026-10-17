import { Bath, BedDouble, Calendar, BadgeCheck, Tag } from "lucide-react";
import { Listing } from "@/lib/types";
import { formatCondition, formatDate } from "@/lib/utils";

interface Props {
  listing: Listing;
}

type MetadataEntry = {
  icon: React.ReactNode;
  text: string;
};

const ICON_CLASS = "h-5 w-5 flex-shrink-0";

function getMetadataEntries(listing: Listing): MetadataEntry[] {
  switch (listing.listing_type) {
    case "item":
      return [
        { icon: <Tag className={ICON_CLASS} />, text: listing.additional_data.category },
        {
          icon: <BadgeCheck className={ICON_CLASS} />,
          text: formatCondition(listing.additional_data.condition),
        },
      ];
    case "sublet": {
      const { start_date, end_date, beds, baths } = listing.additional_data;
      return [
        {
          icon: <Calendar className={ICON_CLASS} />,
          text: `${formatDate(start_date)} - ${formatDate(end_date)}`,
        },
        {
          icon: <BedDouble className={ICON_CLASS} />,
          text: beds === 0 ? "Studio" : `${beds} ${beds === 1 ? "bed" : "beds"}`,
        },
        {
          icon: <Bath className={ICON_CLASS} />,
          text: `${baths} ${baths === 1 ? "bath" : "baths"}`,
        },
      ];
    }
    default:
      return [];
  }
}

export const ListingMetadata = ({ listing }: Props) => {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 md:gap-0 md:divide-x md:divide-gray-300">
      {getMetadataEntries(listing).map(({ icon, text }) => (
        <li key={text} className="flex items-center gap-2 md:px-5 md:first:pl-0 md:last:pr-0">
          {icon}
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
};
