"use client";

import { useState } from "react";
import { Heart, Share } from "lucide-react";
import { Item, Sublet } from "@/lib/types";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { UserCard } from "@/components/listings/detail/UserCard";
import { BackButton } from "@/components/listings/detail/BackButton";
import { addToUsersFavorites, deleteFromUsersFavorites } from "@/lib/actions";

interface Props {
  listing: Item | Sublet;
  initialIsFavorited: boolean;
}

export const ListingDetail = ({ listing, initialIsFavorited }: Props) => {
  const listingType = listing.listing_type;
  const priceLabel = listingType === "sublet" ? "/mo" : undefined;
  const listingOwnerLabel = listingType === "item" ? "Seller" : "Owner";
  const [isInsideFavorites, setIsInsideFavorites] = useState(initialIsFavorited);

  const handleToggleFavorite = async () => {
    try {
      if (isInsideFavorites) {
        await deleteFromUsersFavorites(listing.id);
        setIsInsideFavorites(false);
      } else {
        await addToUsersFavorites(listing.id);
        setIsInsideFavorites(true);
      }
    } catch (err) {
      // Ignore favorite toggle errors in UI
      console.log(err);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[96rem] flex-col p-8 px-4 sm:px-12">
      <div className="mb-4 flex items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-3">
          <Share className="h-5 w-5" />
          <button
            type="button"
            style={{ cursor: "pointer" }}
            onClick={handleToggleFavorite}
            aria-pressed={isInsideFavorites}
            aria-label={isInsideFavorites ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={isInsideFavorites ? "h-5 w-5 fill-red-500 text-red-500" : "h-5 w-5"}
            />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ListingImageGallery images={listing.images} />
        <div className="space-y-6">
          <ListingInfo
            title={listing.title}
            price={listing.price}
            description={listing.description}
            priceLabel={priceLabel}
            {...listing.additional_data}
          />
          <UserCard user={listing.seller} label={listingOwnerLabel} />
          <ListingActions
            listingId={listing.id}
            listingPrice={listing.price}
            priceLabel={priceLabel}
            listingOwnerLabel={listingOwnerLabel}
          />
        </div>
      </div>
    </div>
  );
};
