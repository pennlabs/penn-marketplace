import { Heart, Share } from "lucide-react";
import { Item, Sublet } from "@/lib/types";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { UserCard } from "@/components/listings/detail/UserCard";
import { BackButton } from "@/components/listings/detail/BackButton";

interface Props {
  listing: Item | Sublet;
}

export const ListingDetail = ({ listing }: Props) => {
  const listingType = listing.listing_type;

  return (
    <div className="max-w-[96rem] flex flex-col w-full p-8 sm:px-12 px-4">
      <div className="flex items-center justify-between mb-4">
        <BackButton />
        <div className="flex items-center gap-3">
          <Share className="w-5 h-5" />
          <Heart className="w-5 h-5" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8">
        <ListingImageGallery images={listing.images} />
        <div className="space-y-6">
          <ListingInfo
            title={listing.title}
            price={listing.price}
            description={listing.description}
            priceLabel={listingType === "sublet" ? "/mo" : undefined}
            {...listing.additional_data}
          />
          <UserCard user={listing.seller} label={listingType === "item" ? "Seller" : "Owner"} />
          <ListingActions />
        </div>
      </div>
    </div>
  );
}