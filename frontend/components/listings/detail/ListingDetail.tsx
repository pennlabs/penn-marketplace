"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToUsersFavorites, deleteFromUsersFavorites, getListing } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { Heart } from "lucide-react";
import { Item, Offer, Sublet } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { ListingDescription } from "@/components/listings/detail/ListingDescription";
import { ListingDetailsSection } from "@/components/listings/detail/ListingDetailsSection";
import { ListingMetadata } from "@/components/listings/detail/ListingMetadata";
import { BackButton } from "@/components/listings/detail/BackButton";
import { ShareButton } from "@/components/listings/detail/ShareButton";
import { SubletMap } from "@/components/listings/detail/SubletMap";
import { OffersPanel } from "@/components/listings/offer/OffersPanel";

interface Props {
  listingId: number;
  isOwner: boolean;
  offersReceived: Offer[];
  myOfferGiven?: Offer | null;
}

const ICON_BUTTON_CLASS =
  "flex size-10 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50";

export const ListingDetail = ({
  listingId,
  isOwner,
  offersReceived,
  myOfferGiven = null,
}: Props) => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.listing(listingId);

  const { data: listing } = useQuery({
    queryKey,
    queryFn: () => getListing(String(listingId)),
  });

  const isFavorited = listing?.is_favorited ?? false;

  const toggleFavoriteMutation = useMutation({
    meta: { suppressErrorToast: true }, // since it's noisy to show error toast on top of optimistic update
    mutationFn: async (shouldFavorite: boolean) => {
      if (shouldFavorite) {
        await addToUsersFavorites(listingId);
      } else {
        await deleteFromUsersFavorites(listingId);
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

  if (!listing) return null;

  const listingType = listing.listing_type;
  const priceLabel = listingType === "sublet" ? "/mo" : undefined;
  const listingOwnerLabel = listingType === "item" ? "Seller" : "Owner";
  const shareText = `Check out "${listing.title}" on Penn Marketplace`;

  const subletCoords = listingType === "sublet" ? listing.additional_data : null;
  const hasLocation = subletCoords?.latitude != null && subletCoords?.longitude != null;

  const detailsSection = (
    <ListingDetailsSection
      seller={listing.seller}
      ownerLabel={listingOwnerLabel}
      createdAt={listing.created_at}
    />
  );
  const descriptionSection = <ListingDescription description={listing.description} />;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-2">
          <ShareButton title={listing.title} text={shareText} className={ICON_BUTTON_CLASS} />
          <button
            type="button"
            className={ICON_BUTTON_CLASS}
            onClick={handleToggleFavorite}
            aria-pressed={isFavorited}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={isFavorited ? "h-5 w-5 fill-red-500 text-red-500" : "h-5 w-5"} />
          </button>
        </div>
      </div>

      <ListingImageGallery images={listing.images.map((img) => img.image_url)} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-8 md:gap-y-6">
        <h1 className="text-2xl font-bold break-words md:text-4xl">{listing.title}</h1>
        <div className="flex items-baseline gap-1 md:justify-end md:self-center">
          <p className="text-brand text-2xl font-bold md:text-3xl">{formatPrice(listing.price)}</p>
          {priceLabel && <p className="text-lg text-gray-600">{priceLabel}</p>}
        </div>
        <div className="md:self-center">
          <ListingMetadata listing={listing} />
        </div>
        <div className="md:justify-self-end">
          <ListingActions
            listing={listing}
            listingPrice={listing.price}
            priceLabel={priceLabel}
            listingOwnerLabel={listingOwnerLabel}
            isOwner={isOwner}
            initialMyOffer={myOfferGiven}
          />
        </div>
      </div>

      <OffersPanel
        isOwner={isOwner}
        offersReceived={offersReceived}
        myOfferGiven={myOfferGiven}
        listingId={listing.id}
      />

      <hr className="border-gray-200" />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
        {hasLocation ? (
          <>
            <div className="space-y-10">
              {detailsSection}
              {descriptionSection}
            </div>
            <section className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{"Where you'll be living"}</h2>
                <p className="text-sm text-gray-500">
                  Approximate location shown. The exact location will be shared once you connect
                  with the owner.
                </p>
              </div>
              <SubletMap latitude={subletCoords.latitude!} longitude={subletCoords.longitude!} />
            </section>
          </>
        ) : (
          <>
            {detailsSection}
            {descriptionSection}
          </>
        )}
      </div>
    </div>
  );
};
