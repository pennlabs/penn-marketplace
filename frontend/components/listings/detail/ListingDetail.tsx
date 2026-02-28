"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Clock, Heart, Share, Star, X } from "lucide-react";
import { Item, ItemCategory, ItemCondition, Offer, PaginatedResponse, Sublet } from "@/lib/types";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { UserCard } from "@/components/listings/detail/UserCard";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { BackButton } from "@/components/listings/detail/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/common/FormSelect";
import {
  acceptOffer,
  addToUsersFavorites,
  deleteListing,
  deleteFromUsersFavorites,
  rejectOffer,
  updateListing,
} from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function formatOfferDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatOfferTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  accepted: { label: "Accepted", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

const OfferCard = ({
  offer,
  offersMode,
  onStatusChange,
}: {
  offer: Offer;
  offersMode: "received" | "made";
  onStatusChange: (id: number, status: Offer["status"]) => void;
}) => {
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  const handleAccept = async () => {
    setLoading("accept");
    try {
      await acceptOffer(offer.id);
      onStatusChange(offer.id, "accepted");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading("reject");
    try {
      await rejectOffer(offer.id);
      onStatusChange(offer.id, "rejected");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const badge = STATUS_BADGE[offer.status];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex gap-3">
        {offersMode === "received" && (
          <Image
            src="/images/default-avatar.png"
            alt={`${offer.user.first_name} ${offer.user.last_name}`}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">${offer.offered_price.toLocaleString()}</span>
            <div className="flex items-center gap-2">
              {badge && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>
                  {formatOfferDate(offer.created_at)} at {formatOfferTime(offer.created_at)}
                </span>
              </div>
            </div>
          </div>
          {offersMode === "received" && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {offer.user.first_name} {offer.user.last_name}
              </span>
              <div className="flex items-center gap-0.5 text-sm text-gray-500">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span>5.0</span>
              </div>
            </div>
          )}
          {offer.message && <p className="mt-1.5 text-sm text-gray-500">{offer.message}</p>}
          {offersMode === "received" && offer.status === "pending" && (
            <div className="mt-3 flex justify-end gap-2">
              <Button
                size="sm"
                className="cursor-pointer bg-green-600 text-white hover:bg-green-700"
                onClick={handleAccept}
                disabled={loading !== null}
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                {loading === "accept" ? "Accepting..." : "Accept"}
              </Button>
              <Button
                size="sm"
                className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
                onClick={handleReject}
                disabled={loading !== null}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                {loading === "reject" ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OffersSection = ({
  offers: initialOffers,
  offersMode,
}: {
  offers: Offer[];
  offersMode: "received" | "made";
}) => {
  const [offers, setOffers] = useState(initialOffers);

  const handleStatusChange = (id: number, status: Offer["status"]) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">
        {offersMode === "received" ? "Offers from others" : "My offers"}
      </h2>
      {offers.length === 0 ? (
        <p className="text-sm text-gray-500">No offers yet.</p>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              offersMode={offersMode}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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

  useEffect(() => {
    console.log("listing", listingState);
  }, [listingState]);

  const toggleFavoriteMutation = useMutation({
    meta: { suppressErrorToast: true },
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate(!isFavorited);
  };

  const resetDrafts = () => {
    setDraftTitle(listingState.title);
    setDraftPrice(listingState.price.toString());
    setDraftDescription(listingState.description);
    if (listingState.listing_type === "item") {
      setDraftCategory(listingState.additional_data.category);
      setDraftCondition(resolveConditionValue(listingState.additional_data.condition));
    }
    setDraftExpiresAt(listingState.expires_at ? listingState.expires_at.slice(0, 10) : "");
  };

  const handleEditCancel = () => {
    resetDrafts();
    setIsEditing(false);
  };

  const handleEditStart = () => {
    resetDrafts();
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    const priceValue = Number(draftPrice);
    if (!Number.isFinite(priceValue)) return;

    try {
      const nextListing = await updateListing(listingState.id, {
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
      setListingState(nextListing);
      setIsEditing(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteListing(listingState.id);
      window.location.href = "/";
    } catch (err) {
      console.log(err);
      setIsDeleting(false);
      setIsDeleteOpen(false);
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
        <div className="space-y-6">
          <ListingInfo
            title={listingState.title}
            price={listingState.price}
            description={listingState.description}
            priceLabel={priceLabel}
            {...listingState.additional_data}
          />
          <UserCard user={listingState.seller} label={listingOwnerLabel} />
          <ListingActions
            listingId={listingState.id}
            listingPrice={listingState.price}
            priceLabel={priceLabel}
            listingOwnerLabel={listingOwnerLabel}
            canEdit={canEdit}
          />
          <OffersSection offers={offers} offersMode={offersMode} />
          {canEdit && (
            <>
              <div className="flex items-center justify-end gap-2">
                <Button className="cursor-pointer" variant="outline" onClick={handleEditStart}>
                  Edit Listing
                </Button>
                <Button
                  className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  Delete Item
                </Button>
              </div>
              <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Item</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this Item?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      onClick={() => setIsDeleteOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Item"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isEditing}
                onOpenChange={(open) => (!open ? handleEditCancel() : handleEditStart())}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Listing</DialogTitle>
                    <DialogDescription>Update your listing details below.</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Price</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draftPrice}
                        onChange={(e) => setDraftPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <Textarea
                        value={draftDescription}
                        onChange={(e) => setDraftDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
                    {listingState.listing_type === "item" && (
                      <>
                        <FormSelect
                          label="Product Category"
                          value={draftCategory || ""}
                          onChange={(value) => setDraftCategory(value as ItemCategory)}
                          options={CATEGORY_OPTIONS}
                          placeholder="Select Category"
                        />
                        <FormSelect
                          label="Condition"
                          value={draftCondition || ""}
                          onChange={(value) => setDraftCondition(value as ItemCondition)}
                          options={CONDITION_OPTIONS}
                          placeholder="Select Condition"
                        />
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button className="cursor-pointer" variant="outline" onClick={handleEditCancel}>
                      Cancel
                    </Button>
                    <Button className="cursor-pointer" onClick={handleEditSave}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
