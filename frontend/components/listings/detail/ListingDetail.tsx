"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Share } from "lucide-react";
import { Item, Offer, Sublet } from "@/lib/types";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { UserCard } from "@/components/listings/detail/UserCard";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { OffersPanel } from "@/components/listings/offer/OffersPanel";
import { BackButton } from "@/components/listings/detail/BackButton";
import { SubletMap } from "@/components/listings/detail/SubletMap";
import {
  addToUsersFavorites,
  deleteFromUsersFavorites,
  getListing,
} from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";

interface Props {
  listing: Item | Sublet;
  initialIsFavorited: boolean;
  offersReceived: Offer[];
  isOwner: boolean;
  myOfferGiven?: Offer | null;
}

export const ListingDetail = ({
  listing,
  initialIsFavorited,
  offersReceived,
  isOwner,
  myOfferGiven = null,
}: Props) => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.listing(listing.id);

  const listingQuery = useQuery({
    queryKey,
    queryFn: () => getListing(listing.id.toString()),
    initialData: {
      ...listing,
      is_favorited: listing.is_favorited ?? initialIsFavorited,
    },
    staleTime: Infinity,
  });
  const listingData = listingQuery.data;

  const listingType = listingData.listing_type;
  const priceLabel = listingType === "sublet" ? "/mo" : undefined;
  const listingOwnerLabel = listingType === "item" ? "Seller" : "Owner";

  const isFavorited = listingData.is_favorited ?? false;

  const toggleFavoriteMutation = useMutation({
    meta: { suppressErrorToast: true }, // since it's noisy to show error toast on top of optimistic update
    mutationFn: async (shouldFavorite: boolean) => {
      if (shouldFavorite) {
        await addToUsersFavorites(listingData.id);
      } else {
        await deleteFromUsersFavorites(listingData.id);
      }
    },
    onMutate: async (shouldFavorite: boolean) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Item | Sublet>(queryKey);
      if (previous) {
        queryClient.setQueryData(queryKey, { ...previous, is_favorited: shouldFavorite });
      }
      return { previous };
    },
    onError: (_error, _shouldFavorite, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });

  const handleToggleFavorite = async () => {
    toggleFavoriteMutation.mutate(!isFavorited);
  };

  const subletCoords =
    listingData.listing_type === "sublet" ? listingData.additional_data : null;
  const hasLocation = subletCoords?.latitude != null && subletCoords?.longitude != null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-3">
          <Share className="h-5 w-5" />
          <button
            type="button"
            className="cursor-pointer"
            onClick={handleToggleFavorite}
            aria-pressed={isFavorited}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={isFavorited ? "h-5 w-5 fill-red-500 text-red-500" : "h-5 w-5"} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ListingImageGallery images={listingData.images} />
        <div className="space-y-6">
          <ListingInfo
            title={listingData.title}
            price={listingData.price}
            description={listingData.description}
            priceLabel={priceLabel}
            {...listingData.additional_data}
          />
          <UserCard user={listingData.seller} label={listingOwnerLabel} />
          {hasLocation && (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold">{"Where you'll be living"}</h2>
                <p className="text-sm text-gray-500">
                  Approximate location shown. The exact location will be shared once you connect with
                  the owner.
                </p>
              </div>
              <SubletMap latitude={subletCoords!.latitude!} longitude={subletCoords!.longitude!} />
            </div>
          )}
          <ListingActions
            listing={listingData}
            listingPrice={listingData.price}
            priceLabel={priceLabel}
            listingOwnerLabel={listingOwnerLabel}
            isOwner={isOwner}
            initialMyOffer={myOfferGiven}
          />
          <OffersPanel
            isOwner={isOwner}
            offersReceived={offersReceived}
            myOfferGiven={myOfferGiven}
            listingId={listingData.id}
          />
        </div>
      </div>
    </>
  );
};
