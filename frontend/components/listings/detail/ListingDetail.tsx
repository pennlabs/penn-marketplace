"use client";

import { useMemo } from "react";
import { Heart, Share } from "lucide-react";
import { Item, PaginatedResponse, Sublet } from "@/lib/types";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { UserCard } from "@/components/listings/detail/UserCard";
import { BackButton } from "@/components/listings/detail/BackButton";
import { addToUsersFavorites, deleteFromUsersFavorites, getUsersFavorites } from "@/lib/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Props {
  listing: Item | Sublet;
  initialFavorites: PaginatedResponse<Item | Sublet> | null;
}

export const ListingDetail = ({ listing, initialFavorites }: Props) => {
  const listingType = listing.listing_type;
  const priceLabel = listingType === "sublet" ? "/mo" : undefined;
  const listingOwnerLabel = listingType === "item" ? "Seller" : "Owner";
  const queryClient = useQueryClient();
  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: getUsersFavorites,
    initialData: initialFavorites ?? undefined,
    enabled: initialFavorites !== null,
  });

  const isInsideFavorites = useMemo(
    () => !!favoritesQuery.data?.results?.some((favorite) => favorite.id === listing.id),
    [favoritesQuery.data, listing.id]
  );

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (shouldFavorite: boolean) => {
      if (shouldFavorite) {
        await addToUsersFavorites(listing.id);
      } else {
        await deleteFromUsersFavorites(listing.id);
      }
    },
    onMutate: async (shouldFavorite: boolean) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previous = queryClient.getQueryData<PaginatedResponse<Item | Sublet>>(["favorites"]);

      if (previous) {
        const exists = previous.results?.some((favorite) => favorite.id === listing.id);
        let results = previous.results ?? [];

        if (shouldFavorite && !exists) {
          results = [...results, listing];
        }
        if (!shouldFavorite && exists) {
          results = results.filter((favorite) => favorite.id !== listing.id);
        }

        queryClient.setQueryData<PaginatedResponse<Item | Sublet>>(["favorites"], {
          ...previous,
          results,
        });
      }

      return { previous };
    },
    onError: (_error, _shouldFavorite, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["favorites"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const handleToggleFavorite = async () => {
    toggleFavoriteMutation.mutate(!isInsideFavorites);
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
