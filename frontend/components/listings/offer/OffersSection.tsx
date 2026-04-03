"use client";

import { useState } from "react";
import { Offer } from "@/lib/types";
import { OfferCard } from "@/components/listings/offer/OfferCard";

export const OffersSection = ({
  offers: initialOffers,
}: {
  offers: Offer[];
}) => {
  const [offers, setOffers] = useState(initialOffers);

  const handleStatusChange = (id: number, status: Offer["status"]) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Offers from others</h2>
      {offers.length === 0 ? (
        <p className="text-sm text-gray-500">No offers yet.</p>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
