"use client";

import { useState } from "react";
import { Item, ItemCategory, ItemCondition, Offer, Sublet } from "@/lib/types";
import { ListingActions } from "@/components/listings/detail/ListingActions";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { UserCard } from "@/components/listings/detail/UserCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/common/FormSelect";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";
import { deleteListing } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface PersonalItemViewProps {
  listing: Item | Sublet;
  priceLabel?: string;
  listingOwnerLabel: string;
  isEditing: boolean;
  draftTitle: string;
  draftPrice: string;
  draftDescription: string;
  draftCategory: ItemCategory | "";
  draftCondition: ItemCondition | "";
  draftImages: File[];
  onDraftTitleChange: (value: string) => void;
  onDraftPriceChange: (value: string) => void;
  onDraftDescriptionChange: (value: string) => void;
  onDraftCategoryChange: (value: ItemCategory | "") => void;
  onDraftConditionChange: (value: ItemCondition | "") => void;
  onDraftImagesChange: (files: File[]) => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  onEditStart: () => void;
  offers: Offer[];
  offersMode: "received" | "made";
}

export const PersonalItemView = ({
  listing,
  priceLabel,
  listingOwnerLabel,
  isEditing,
  draftTitle,
  draftPrice,
  draftDescription,
  draftCategory,
  draftCondition,
  draftImages,
  onDraftTitleChange,
  onDraftPriceChange,
  onDraftDescriptionChange,
  onDraftCategoryChange,
  onDraftConditionChange,
  onDraftImagesChange,
  onEditCancel,
  onEditSave,
  onEditStart,
  offers,
  offersMode,
}: PersonalItemViewProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteListing(listing.id);
      window.location.href = "/";
    } catch (err) {
      console.log(err);
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <ListingInfo
        title={listing.title}
        price={listing.price}
        description={listing.description}
        priceLabel={priceLabel}
        {...listing.additional_data}
      />
      <div className="flex items-center justify-between gap-3">
        <UserCard user={listing.seller} label={listingOwnerLabel} />
      </div>
      <ListingActions
        listingId={listing.id}
        listingPrice={listing.price}
        priceLabel={priceLabel}
        listingOwnerLabel={listingOwnerLabel}
        canEdit
      />
      <OffersSection offers={offers} offersMode={offersMode} />
      <div className="flex items-center justify-end gap-2">
        <Button className="cursor-pointer" variant="outline" onClick={onEditStart}>
          Edit Listing
        </Button>
        <Button
          className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
          onClick={() => setIsDeleteOpen(true)}
        >
          Delete Item
        </Button>
      </div>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>Are you sure you want to delete this Item?</DialogDescription>
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
              className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditing} onOpenChange={(open) => (!open ? onEditCancel() : onEditStart())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
            <DialogDescription>Update your listing details below.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input value={draftTitle} onChange={(e) => onDraftTitleChange(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Price</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={draftPrice}
                onChange={(e) => onDraftPriceChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                value={draftDescription}
                onChange={(e) => onDraftDescriptionChange(e.target.value)}
                rows={4}
              />
            </div>
            {listing.listing_type === "item" && (
              <>
                <FormSelect
                  label="Product Category"
                  value={draftCategory || ""}
                  onChange={(value) => onDraftCategoryChange(value as ItemCategory)}
                  options={CATEGORY_OPTIONS}
                  placeholder="Select Category"
                />
                <FormSelect
                  label="Condition"
                  value={draftCondition || ""}
                  onChange={(value) => onDraftConditionChange(value as ItemCondition)}
                  options={CONDITION_OPTIONS}
                  placeholder="Select Condition"
                />
              </>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Update Images</label>
              <Input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/heic"
                onChange={(e) => {
                  if (e.target.files) {
                    onDraftImagesChange(Array.from(e.target.files));
                  }
                }}
              />
              {draftImages.length > 0 && (
                <p className="text-xs text-gray-500">{draftImages.length} image(s) selected</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button className="cursor-pointer" variant="outline" onClick={onEditCancel}>
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={onEditSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
