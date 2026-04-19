"use client";

import { Heart, Share } from "lucide-react";
import { Item, Offer, PaginatedResponse, Sublet } from "@/lib/types";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { UserCard } from "@/components/listings/detail/UserCard";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { OffersReceivedSection } from "@/components/listings/offer/OffersSection";
import { BackButton } from "@/components/listings/detail/BackButton";
import {
  addToUsersFavorites,
  deleteFromUsersFavorites,
  getListing,
} from "@/lib/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

  const listingQuery = useQuery({
    queryKey: ["listing", listing.id],
    queryFn: () => getListing(listing.id.toString()),
    initialData: listing,
    staleTime: Infinity,
  });
  const listingData = listingQuery.data;

  const listingType = listingData.listing_type;
  const priceLabel = listingType === "sublet" ? "/mo" : undefined;
  const listingOwnerLabel = listingType === "item" ? "Seller" : "Owner";

  const favoritesQuery = useQuery({
    queryKey: ["favorite", listing.id],
    queryFn: async () => initialIsFavorited,
    initialData: initialIsFavorited,
    staleTime: Infinity,
  });
  const isFavorited = favoritesQuery.data ?? false;

  const toggleFavoriteMutation = useMutation({
    meta: { suppressErrorToast: true },
    mutationFn: async (shouldFavorite: boolean) => {
      if (shouldFavorite) {
        await addToUsersFavorites(listingData.id);
      } else {
        await deleteFromUsersFavorites(listingData.id);
      }
    },
    onMutate: async (shouldFavorite: boolean) => {
      await queryClient.cancelQueries({ queryKey: ["favorite", listing.id] });
      const previousFavorite = queryClient.getQueryData<boolean>(["favorite", listing.id]);
      queryClient.setQueryData(["favorite", listing.id], shouldFavorite);
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previousFavoritesList = queryClient.getQueryData<PaginatedResponse<Item | Sublet>>([
        "favorites",
      ]);

      if (previousFavoritesList) {
        const exists = previousFavoritesList.results?.some(
          (favorite) => favorite.id === listingData.id
        );
        let results = previousFavoritesList.results ?? [];

        if (shouldFavorite && !exists) {
          results = [...results, listingData];
        }
        if (!shouldFavorite && exists) {
          results = results.filter((favorite) => favorite.id !== listingData.id);
        }

        queryClient.setQueryData<PaginatedResponse<Item | Sublet>>(["favorites"], {
          ...previousFavoritesList,
          results,
        });
      }

      return { previousFavorite, previousFavoritesList };
    },
    onError: (_error, _shouldFavorite, context) => {
      if (context?.previousFavorite !== undefined) {
        queryClient.setQueryData(["favorite", listing.id], context.previousFavorite);
      }
      if (context?.previousFavoritesList !== undefined) {
        queryClient.setQueryData(["favorites"], context.previousFavoritesList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const handleToggleFavorite = () => {
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
          <ListingActions
            listing={listingData}
            listingPrice={listingData.price}
            priceLabel={priceLabel}
            listingOwnerLabel={listingOwnerLabel}
            isOwner={isOwner}
          />
          <OffersReceivedSection
            isOwner={isOwner}
            offersReceived={offersReceived}
            myOfferGiven={myOfferGiven}
            listingId={listingData.id}
          />
        </div>
      </div>
    </div>
  );
};
