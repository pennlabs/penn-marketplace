"use client";

import { Item, Offer, Sublet } from "@/lib/types";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { UserCard } from "@/components/listings/detail/UserCard";

interface OfferSectionProps {
  offers: Offer[];
  offersMode: "received" | "made";
}

const OffersSection = ({ offers, offersMode }: OfferSectionProps) => (
  <div className="space-y-3">
    <h2 className="text-lg font-semibold">
      {offersMode === "received" ? "Offers from others" : "My offers"}
    </h2>
    {offers.length === 0 ? (
      <p className="text-sm text-gray-500">No offers yet.</p>
    ) : (
      <div className="space-y-3">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">${offer.offered_price.toLocaleString()}</span>
              <span className="text-gray-500">
                {new Date(offer.created_at).toLocaleDateString()}
              </span>
            </div>
            {offersMode === "received" && (
              <p className="mt-1 text-gray-600">
                From {offer.user.first_name} {offer.user.last_name}
              </p>
            )}
            {offer.message && <p className="mt-2 text-gray-600">{offer.message}</p>}
          </div>
        ))}
      </div>
    )}
  </div>
);

interface ExternalItemViewProps {
  listing: Item | Sublet;
  priceLabel?: string;
  listingOwnerLabel: string;
  offers: Offer[];
  offersMode: "received" | "made";
}

export const ExternalItemView = ({
  listing,
  priceLabel,
  listingOwnerLabel,
  offers,
  offersMode,
}: ExternalItemViewProps) => (
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
    <OffersSection offers={offers} offersMode={offersMode} />
  </div>
);
