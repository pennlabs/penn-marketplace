"use client";

import { useState } from "react";
import Link from "next/link";
import { DollarSign } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MakeOfferModal } from "@/components/listings/offer/MakeOfferModal";
import { PhoneInputModal } from "@/components/listings/offer/PhoneInputModal";
import { VerificationCodeModal } from "@/components/listings/offer/VerificationCodeModal";
import { DeleteListing } from "@/components/listings/detail/DeleteListing";
import { Button } from "@/components/ui/button";
import { getMyOfferForListing, getPhoneStatus } from "@/lib/actions";
import type { Item, Offer, Sublet } from "@/lib/types";

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: phoneStatus } = useQuery({
    queryKey: ["phoneStatus"],
    queryFn: getPhoneStatus,
    enabled: !isOwner,
  });

  const { data: myOffer, isLoading: isLoadingMyOffer } = useQuery({
    queryKey: ["myOffer", listing.id],
    queryFn: () => getMyOfferForListing(listing.id),
    enabled: !isOwner,
    initialData: initialMyOffer,
  });

  if (isOwner) {
    const typeLabel = listing.listing_type === "sublet" ? "Sublet" : "Item";
    const editHref =
      listing.listing_type === "sublet" ? `/edit/sublet/${listing.id}` : `/edit/item/${listing.id}`;

    return (
      <>
        <div className="flex items-center gap-2 md:justify-end">
          <Button className="h-12 cursor-pointer rounded-lg px-6" variant="outline" asChild>
            <Link href={editHref}>Edit Listing</Link>
          </Button>
          <Button
            className="h-12 cursor-pointer rounded-lg bg-red-500 px-6 text-white hover:bg-red-600"
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete {typeLabel}
          </Button>
        </div>
        <DeleteListing listing={listing} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
      </>
    );
  }

  const handleMakeOfferClick = () => {
    if (!phoneStatus) return;

    if (!phoneStatus.phone_number || !phoneStatus.phone_verified) {
      // no phone number or not verified - start with phone input
      // if we already have a pending phone number, go to verification
      if (pendingPhoneNumber) {
        setModalState("verification");
      } else {
        setModalState("phone-input");
      }
    } else {
      // phone verified - show create offer modal
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

  return (
    <>
      {/* one offer per listing: once made, it's managed from the OffersPanel instead */}
      {!isLoadingMyOffer && !myOffer && (
        <Button
          onClick={handleMakeOfferClick}
          className="bg-brand hover:bg-brand-hover h-12 w-full cursor-pointer rounded-lg px-6 text-base text-white md:w-auto"
        >
          <DollarSign className="mr-2 h-5 w-5" />
          Make an Offer
        </Button>
      )}

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
