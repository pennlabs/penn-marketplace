"use client";

import { useState } from "react";
import { Heart, Share } from "lucide-react";
import { Item, ItemCategory, ItemCondition, Offer, PaginatedResponse, Sublet } from "@/lib/types";
import { CONDITION_OPTIONS } from "@/lib/constants";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { BackButton } from "@/components/listings/detail/BackButton";
import {
  addToUsersFavorites,
  deleteFromUsersFavorites,
  getListing,
  updateListing,
  uploadListingImages,
} from "@/lib/actions";
import { ExternalItemView } from "@/components/listings/detail/ExternalItemView";
import { PersonalItemView } from "@/components/listings/detail/PersonalItemView";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Props {
  listing: Item | Sublet;
  initialIsFavorited: boolean;
  offers: Offer[];
  offersMode: "received" | "made";
  canEdit: boolean;
}

export const ListingDetail = ({
  listing,
  initialIsFavorited,
  offers,
  offersMode,
  canEdit,
}: Props) => {
  const [listingState, setListingState] = useState(listing);
  const listingType = listingState.listing_type;
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
    mutationFn: async (shouldFavorite: boolean) => {
      if (shouldFavorite) {
        await addToUsersFavorites(listingState.id);
      } else {
        await deleteFromUsersFavorites(listingState.id);
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
          (favorite) => favorite.id === listingState.id
        );
        let results = previousFavoritesList.results ?? [];

        if (shouldFavorite && !exists) {
          results = [...results, listingState];
        }
        if (!shouldFavorite && exists) {
          results = results.filter((favorite) => favorite.id !== listingState.id);
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

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(listingState.title);
  const [draftPrice, setDraftPrice] = useState(listingState.price.toString());
  const [draftDescription, setDraftDescription] = useState(listingState.description);
  const [draftCategory, setDraftCategory] = useState<ItemCategory | "">(
    listingState.listing_type === "item" ? listingState.additional_data.category : ""
  );
  const resolveConditionValue = (condition: string) =>
    CONDITION_OPTIONS.find((option) => option.label === condition)?.value ??
    (condition as ItemCondition);

  const [draftCondition, setDraftCondition] = useState<ItemCondition | "">(
    listingState.listing_type === "item"
      ? resolveConditionValue(listingState.additional_data.condition)
      : ""
  );
  const [draftExpiresAt, setDraftExpiresAt] = useState(
    listingState.expires_at ? listingState.expires_at.slice(0, 10) : ""
  );
  const [draftImages, setDraftImages] = useState<File[]>([]);

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate(!isFavorited);
  };

  const handleEditCancel = () => {
    setDraftTitle(listingState.title);
    setDraftPrice(listingState.price.toString());
    setDraftDescription(listingState.description);
    if (listingState.listing_type === "item") {
      setDraftCategory(listingState.additional_data.category);
      setDraftCondition(resolveConditionValue(listingState.additional_data.condition));
    }
    setDraftExpiresAt(listingState.expires_at ? listingState.expires_at.slice(0, 10) : "");
    setDraftImages([]);
    setIsEditing(false);
  };

  const handleEditStart = () => {
    setDraftTitle(listingState.title);
    setDraftPrice(listingState.price.toString());
    setDraftDescription(listingState.description);
    if (listingState.listing_type === "item") {
      setDraftCategory(listingState.additional_data.category);
      setDraftCondition(resolveConditionValue(listingState.additional_data.condition));
    }
    setDraftExpiresAt(listingState.expires_at ? listingState.expires_at.slice(0, 10) : "");
    setDraftImages([]);
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    const priceValue = Number(draftPrice);
    if (!Number.isFinite(priceValue)) {
      return;
    }

    try {
      const updated = await updateListing(listingState.id, {
        title: draftTitle.trim(),
        description: draftDescription.trim(),
        price: priceValue,
        listing_type: listingState.listing_type,
        additional_data:
          listingState.listing_type === "item"
            ? {
                ...(draftCondition ? { condition: draftCondition } : {}),
                ...(draftCategory ? { category: draftCategory } : {}),
              }
            : {},
      });
      let nextListing = updated;
      if (draftImages.length > 0) {
        await uploadListingImages(listingState.id, draftImages);
        nextListing = await getListing(String(listingState.id));
        setDraftImages([]);
      }
      setListingState(nextListing);
      setIsEditing(false);
    } catch (err) {
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
        <ListingImageGallery images={listingState.images} />
        {canEdit ? (
          <PersonalItemView
            listing={listingState}
            priceLabel={priceLabel}
            listingOwnerLabel={listingOwnerLabel}
            isEditing={isEditing}
            draftTitle={draftTitle}
            draftPrice={draftPrice}
            draftDescription={draftDescription}
            draftCategory={draftCategory}
            draftCondition={draftCondition}
            draftImages={draftImages}
            onDraftTitleChange={setDraftTitle}
            onDraftPriceChange={setDraftPrice}
            onDraftDescriptionChange={setDraftDescription}
            onDraftCategoryChange={setDraftCategory}
            onDraftConditionChange={setDraftCondition}
            onDraftImagesChange={setDraftImages}
            onEditCancel={handleEditCancel}
            onEditSave={handleEditSave}
            onEditStart={handleEditStart}
            offers={offers}
            offersMode={offersMode}
          />
        ) : (
          <ExternalItemView
            listing={listingState}
            priceLabel={priceLabel}
            listingOwnerLabel={listingOwnerLabel}
            offers={offers}
            offersMode={offersMode}
          />
        )}
      </div>
    </div>
  );
};
