"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MakeOfferModal } from "@/components/listings/offer/MakeOfferModal";
import { PhoneInputModal } from "@/components/listings/offer/PhoneInputModal";
import { VerificationCodeModal } from "@/components/listings/offer/VerificationCodeModal";
import { EditListing } from "@/components/listings/detail/EditListing";
import { DeleteListing } from "@/components/listings/detail/DeleteListing";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPhoneStatus } from "@/lib/actions";
import type { Item, Offer, Sublet } from "@/lib/types";
import { getMyOfferForListing } from "@/lib/actions";
import { MyOfferCard } from "@/components/listings/offer/MyOfferCard";
import { EditMyOfferModal } from "@/components/listings/offer/EditMyOfferModal";
import { deleteMyOfferForListing } from "@/lib/actions";

interface Props {
  listing: Item | Sublet;
  listingPrice: number;
  listingOwnerLabel: string;
  priceLabel?: string;
  isOwner?: boolean;
  initialMyOffer?: Offer | null;
}

type ModalState = "none" | "phone-input" | "verification" | "offer";

export const ListingActions = ({
  listing,
  listingPrice,
  priceLabel,
  listingOwnerLabel,
  isOwner = false,
  initialMyOffer = null,
}: Props) => {
  const [modalState, setModalState] = useState<ModalState>("none");
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string>("");
  const [isChangingPhone, setIsChangingPhone] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: phoneStatus } = useQuery({
    queryKey: ["phoneStatus"],
    queryFn: getPhoneStatus,
    enabled: !isOwner,
  });

  const myOfferQuery = useQuery({
    queryKey: ["myOffer", listing.id],
    queryFn: () => getMyOfferForListing(listing.id),
    initialData: initialMyOffer,
    enabled: !isOwner,
    staleTime: Infinity,
  });

  const myOffer = myOfferQuery.data ?? null;

  const [isEditOfferOpen, setIsEditOfferOpen] = useState(false);
  const [isDeleteOfferOpen, setIsDeleteOfferOpen] = useState(false);

  const deleteMyOfferMutation = useMutation({
    mutationFn: () => deleteMyOfferForListing(listing.id),
    onSuccess: () => {
      setIsDeleteOfferOpen(false);
      queryClient.invalidateQueries({ queryKey: ["myOffer", listing.id] });
    },
  });

  if (isOwner) {
    const typeLabel = listing.listing_type === "sublet" ? "Sublet" : "Item";

    return (
      <>
        <div className="flex items-center justify-end gap-2">
          <Button className="cursor-pointer" variant="outline" onClick={() => setIsEditing(true)}>
            Edit Listing
          </Button>
          <Button
            className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete {typeLabel}
          </Button>
        </div>

        <EditListing
          listing={listing}
          open={isEditing}
          onOpenChange={setIsEditing}
        />
        <DeleteListing
          listing={listing}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
        />
      </>
    );
  }

  const handleMakeOfferClick = () => {
    if (!phoneStatus) return;

    if (!phoneStatus.phone_number || !phoneStatus.phone_verified) {
      if (pendingPhoneNumber) {
        setModalState("verification");
      } else {
        setModalState("phone-input");
      }
    } else {
      setModalState("offer");
    }
  };

  const handlePhoneCodeSent = (phoneNumber: string) => {
    setPendingPhoneNumber(phoneNumber);
    setIsChangingPhone(false);
    setModalState("verification");
  };

  const handlePhoneVerified = () => {
    queryClient.invalidateQueries({ queryKey: ["phoneStatus"] });
    setPendingPhoneNumber("");
    setModalState("offer");
  };

  const handleChangePhone = () => {
    setIsChangingPhone(true);
    setModalState("phone-input");
  };

  if (myOffer) {
    return (
      <>
        <MyOfferCard
          offer={myOffer}
          onEdit={() => setIsEditOfferOpen(true)}
          onDelete={() => setIsDeleteOfferOpen(true)}
        />

        <EditMyOfferModal
          isOpen={isEditOfferOpen}
          onClose={() => setIsEditOfferOpen(false)}
          offer={myOffer}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["myOffer", listing.id] });
            setIsEditOfferOpen(false);
          }}
        />

        <Dialog open={isDeleteOfferOpen} onOpenChange={setIsDeleteOfferOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Offer</DialogTitle>
              <DialogDescription>
                Are you sure you want to withdraw your offer?
              </DialogDescription>
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
    <>
      <Button
        onClick={handleMakeOfferClick}
        className="bg-brand hover:bg-brand-hover h-12 w-full cursor-pointer text-base text-white"
      >
        <DollarSign className="mr-2 h-5 w-5" />
        Make an Offer
      </Button>

      <PhoneInputModal
        isOpen={modalState === "phone-input"}
        onClose={() => setModalState("none")}
        onCodeSent={handlePhoneCodeSent}
        listingOwnerLabel={listingOwnerLabel}
        initialPhoneNumber={isChangingPhone ? "" : phoneStatus?.phone_number || ""}
      />

      <VerificationCodeModal
        isOpen={modalState === "verification"}
        onClose={() => setModalState("none")}
        phoneNumber={pendingPhoneNumber}
        onVerified={handlePhoneVerified}
      />

      <MakeOfferModal
        isOpen={modalState === "offer"}
        onClose={() => setModalState("none")}
        listingId={listing.id}
        listingPrice={listingPrice}
        listingOwnerLabel={listingOwnerLabel}
        priceLabel={priceLabel}
        onChangePhone={handleChangePhone}
      />
    </>
  );
};
