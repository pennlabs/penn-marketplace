"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Offer, PaginatedResponse } from "@/lib/types";
import { OFFERS_PAGE_SIZE } from "@/constants/offers";
import { queryKeys } from "@/lib/queryKeys";
import { OfferCard } from "@/components/listings/offer/OfferCard";
import { EditMyOfferModal } from "@/components/listings/offer/EditMyOfferModal";
import {
  deleteMyOfferForListing,
  getMyOfferForListing,
  getOffersReceivedForListing,
} from "@/lib/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const OffersPanel = ({
  isOwner,
  offersReceived: initialOffersReceived,
  myOfferGiven,
  listingId,
}: {
  isOwner: boolean;
  offersReceived: PaginatedResponse<Offer> | null;
  myOfferGiven: Offer | null;
  listingId: number;
}) => {
  const [isEditOfferOpen, setIsEditOfferOpen] = useState(false);
  const [isDeleteOfferOpen, setIsDeleteOfferOpen] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data: myOffer } = useQuery({
    queryKey: ["myOffer", listingId],
    queryFn: () => getMyOfferForListing(listingId),
    enabled: !isOwner,
    initialData: myOfferGiven,
    staleTime: 30_000,
  });

  const {
    data: offersReceived,
    isPending: isLoadingOffers,
    isFetching: isFetchingOffers,
    error: offersError,
    refetch: refetchOffers,
  } = useQuery({
    queryKey: queryKeys.offersReceivedPage(listingId, page),
    queryFn: () => getOffersReceivedForListing(listingId, page),
    enabled: isOwner,
    initialData: page === 1 ? (initialOffersReceived ?? undefined) : undefined,
    // the server just rendered this list; don't immediately refetch it on mount
    staleTime: 30_000,
  });

  const totalOffers = offersReceived?.count ?? initialOffersReceived?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalOffers / OFFERS_PAGE_SIZE));
  useEffect(() => {
    if (offersReceived && page > totalPages) setPage(totalPages);
  }, [offersReceived, page, totalPages]);

  const handleStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.offersReceived(listingId) });
  };

  const deleteMyOfferMutation = useMutation({
    mutationFn: () => deleteMyOfferForListing(listingId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["myOffer", listingId] });
      const previousOffer = queryClient.getQueryData<Offer | null>(["myOffer", listingId]);
      queryClient.setQueryData<Offer | null>(["myOffer", listingId], null);
      return { previousOffer };
    },
    onSuccess: () => {
      setIsDeleteOfferOpen(false);
    },
    onError: (_error, _vars, context) => {
      if (context?.previousOffer !== undefined) {
        queryClient.setQueryData(["myOffer", listingId], context.previousOffer);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["myOffer", listingId] });
    },
  });

  if (!isOwner) {
    if (!myOffer) return null;

    return (
      <>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Your offer</h2>
          <OfferCard
            variant="mine"
            offer={myOffer}
            onEdit={() => setIsEditOfferOpen(true)}
            onDelete={() => setIsDeleteOfferOpen(true)}
          />
        </div>

        <EditMyOfferModal
          isOpen={isEditOfferOpen}
          onClose={() => setIsEditOfferOpen(false)}
          offer={myOffer}
          onSaved={() => {
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
    <div className="space-y-3" aria-busy={isFetchingOffers}>
      <h2 className="text-lg font-semibold">Offers received</h2>
      {offersError ? (
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-sm">Could not load offers.</p>
          <Button variant="outline" size="sm" onClick={() => refetchOffers()}>
            Try again
          </Button>
        </div>
      ) : isLoadingOffers ? (
        <p className="text-muted-foreground text-sm" role="status">
          Loading offers...
        </p>
      ) : !offersReceived?.results.length ? (
        <p className="text-sm text-gray-500">No offers yet.</p>
      ) : (
        <div className="space-y-3">
          {offersReceived.results.map((offer) => (
            <OfferCard
              key={offer.id}
              variant="received"
              offer={offer}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
      {totalOffers > OFFERS_PAGE_SIZE && (
        <nav aria-label="Offers pagination" className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous offers"
            disabled={page === 1 || isFetchingOffers}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <span className="text-muted-foreground text-sm" aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next offers"
            disabled={page >= totalPages || isFetchingOffers}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  );
};
