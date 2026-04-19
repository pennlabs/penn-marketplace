"use client";

import { useState } from "react";
import { Offer } from "@/lib/types";
import { OfferCard } from "@/components/listings/offer/OfferCard";
import { MyOfferCard } from "@/components/listings/offer/MyOfferCard";
import { EditMyOfferModal } from "@/components/listings/offer/EditMyOfferModal";
import { deleteMyOfferForListing } from "@/lib/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const OffersReceivedSection = ({
  isOwner,
  offersReceived: initialOffersReceived,
  myOfferGiven,
  listingId,
}: {
  isOwner: boolean;
  offersReceived: Offer[];
  myOfferGiven: Offer | null;
  listingId: number;
}) => {
  const [offersReceived, setOffersReceived] = useState(initialOffersReceived);
  const [isEditOfferOpen, setIsEditOfferOpen] = useState(false);
  const [isDeleteOfferOpen, setIsDeleteOfferOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleStatusChange = (id: number, status: Offer["status"]) => {
    setOffersReceived((prev) => prev.map((offer) => (offer.id === id ? { ...offer, status } : offer)));
  };

  const deleteMyOfferMutation = useMutation({
    mutationFn: () => deleteMyOfferForListing(listingId),
    onSuccess: () => {
      setIsDeleteOfferOpen(false);
      queryClient.invalidateQueries({ queryKey: ["myOffer", listingId] });
    },
  });

  if (!isOwner) {
    if (!myOfferGiven) return null;

    return (
      <>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Your offer</h2>
          <MyOfferCard
            offer={myOfferGiven}
            onEdit={() => setIsEditOfferOpen(true)}
            onDelete={() => setIsDeleteOfferOpen(true)}
          />
        </div>

        <EditMyOfferModal
          isOpen={isEditOfferOpen}
          onClose={() => setIsEditOfferOpen(false)}
          offer={myOfferGiven}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["myOffer", listingId] });
            setIsEditOfferOpen(false);
          }}
        />

        <Dialog open={isDeleteOfferOpen} onOpenChange={setIsDeleteOfferOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Offer</DialogTitle>
              <DialogDescription>Are you sure you want to withdraw your offer?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => setIsDeleteOfferOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
                onClick={() => deleteMyOfferMutation.mutate()}
                disabled={deleteMyOfferMutation.isPending}
              >
                {deleteMyOfferMutation.isPending ? "Withdrawing..." : "Withdraw"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Offers received</h2>
      {offersReceived.length === 0 ? (
        <p className="text-sm text-gray-500">No offers yet.</p>
      ) : (
        <div className="space-y-3">
          {offersReceived.map((offer) => (
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

