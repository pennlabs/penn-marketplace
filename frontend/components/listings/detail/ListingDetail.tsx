"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToUsersFavorites, deleteFromUsersFavorites } from "@/lib/actions";
import { Heart, Share } from "lucide-react";
import { Item, Sublet } from "@/lib/types";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { UserCard } from "@/components/listings/detail/UserCard";
import { BackButton } from "@/components/listings/detail/BackButton";

interface Props {
  listing: Item | Sublet;
  initialIsFavorited: boolean;
}

export const ListingDetail = ({ listing, initialIsFavorited }: Props) => {
  const listingType = listing.listing_type;
  const priceLabel = listingType === "sublet" ? "/mo" : undefined;
  const listingOwnerLabel = listingType === "item" ? "Seller" : "Owner";
  const queryClient = useQueryClient();
  const favoritesQuery = useQuery({
    queryKey: ["favorite", listing.id],
    queryFn: async () => initialIsFavorited,
    initialData: initialIsFavorited,
    staleTime: Infinity,
  });

  const isFavorited = favoritesQuery.data ?? false;

  const toggleFavoriteMutation = useMutation({
    meta: { suppressErrorToast: true }, // since it's noisy to show error toast on top of optimistic update
    mutationFn: async (shouldFavorite: boolean) => {
      if (shouldFavorite) {
        await addToUsersFavorites(listing.id);
      } else {
        await deleteFromUsersFavorites(listing.id);
      }
    },
    onMutate: async (shouldFavorite: boolean) => {
      await queryClient.cancelQueries({ queryKey: ["favorite", listing.id] });
      const previous = queryClient.getQueryData<boolean>(["favorite", listing.id]);
      queryClient.setQueryData(["favorite", listing.id], shouldFavorite);
      return { previous };
    },
    onError: (_error, _shouldFavorite, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["favorite", listing.id], context.previous);
      }
    },
  });

  const handleToggleFavorite = async () => {
    toggleFavoriteMutation.mutate(!isFavorited);
  };

  return (
    <div className="mx-auto flex w-full max-w-[96rem] flex-col p-8 px-4 sm:px-12">
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
