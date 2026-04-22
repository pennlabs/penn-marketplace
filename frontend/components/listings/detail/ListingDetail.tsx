"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saveListing, unsaveListing, getListing } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { Bookmark, Share } from "lucide-react";
import { Item, Sublet } from "@/lib/types";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { UserCard } from "@/components/listings/detail/UserCard";
import { BackButton } from "@/components/listings/detail/BackButton";
import { SubletMap } from "@/components/listings/detail/SubletMap";

interface Props {
  listingId: number;
}

export const ListingDetail = ({ listingId }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.listing(listingId);

  const { data: listing } = useQuery({
    queryKey,
    queryFn: () => getListing(String(listingId)),
  });

  const isSaved = listing?.is_saved ?? false;

  const toggleSaveMutation = useMutation({
    meta: { suppressErrorToast: true }, // since it's noisy to show error toast on top of optimistic update
    mutationFn: async (shouldSave: boolean) => {
      if (shouldSave) {
        await saveListing(listingId);
      } else {
        await unsaveListing(listingId);
      }
    },
    onMutate: async (shouldSave: boolean) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Item | Sublet>(queryKey);
      if (previous) {
        queryClient.setQueryData(queryKey, { ...previous, is_saved: shouldSave });
      }
      return { previous };
    },
    onError: (_error, _shouldSave, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });

  const handleToggleSave = async () => {
    toggleSaveMutation.mutate(!isSaved);
  };

  if (!listing) return null;

  const listingType = listing.listing_type;
  const priceLabel = listingType === "sublet" ? "/mo" : undefined;
  const listingOwnerLabel = listingType === "item" ? "Seller" : "Owner";

  const subletCoords = listingType === "sublet" ? listing.additional_data : null;
  const hasLocation = subletCoords?.latitude != null && subletCoords?.longitude != null;

  return (
    <div className="mx-auto flex w-full max-w-[96rem] flex-col p-8 px-4 sm:px-12">
      <div className="mb-4 flex items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-3">
          <Share className="h-5 w-5" />
          <button
            type="button"
            className="cursor-pointer"
            onClick={handleToggleSave}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Unsave listing" : "Save listing"}
          >
            <Bookmark className={isSaved ? "h-5 w-5 fill-blue-500 text-blue-500" : "h-5 w-5"} />
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
          {hasLocation && (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold">{"Where you'll be living"}</h2>
                <p className="text-sm text-gray-500">
                  Approximate location shown. The exact location will be shared once you connect
                  with the owner.
                </p>
              </div>
              <SubletMap latitude={subletCoords.latitude!} longitude={subletCoords.longitude!} />
            </div>
          )}
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
