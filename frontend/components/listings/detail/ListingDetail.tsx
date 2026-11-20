"use client";

import { useQuery } from "@tanstack/react-query";
import { getListing } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { formatPrice } from "@/lib/utils";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { ListingDescription } from "@/components/listings/detail/ListingDescription";
import { ListingDetailsSection } from "@/components/listings/detail/ListingDetailsSection";
import { ListingMetadata } from "@/components/listings/detail/ListingMetadata";
import { BackButton } from "@/components/listings/detail/BackButton";
import { ShareButton } from "@/components/listings/detail/ShareButton";
import { SubletMap } from "@/components/listings/detail/SubletMap";

interface Props {
  listingId: number;
}

const ICON_BUTTON_CLASS =
  "flex size-10 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50";

export const ListingDetail = ({ listingId }: Props) => {
  const { data: listing } = useQuery({
    queryKey: queryKeys.listing(listingId),
    queryFn: () => getListing(String(listingId)),
  });

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
          <FavoriteButton
            listingId={listingId}
            isFavorited={listing.is_favorited}
            className={ICON_BUTTON_CLASS}
          />
        </div>
      </div>

      <ListingImageGallery images={listing.images} />

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
            listingId={listing.id}
            listingPrice={listing.price}
            priceLabel={priceLabel}
            listingOwnerLabel={listingOwnerLabel}
          />
        </div>
      </div>

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
