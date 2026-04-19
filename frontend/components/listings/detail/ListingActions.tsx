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
import { getPhoneStatus } from "@/lib/actions";
import type { Item, Sublet } from "@/lib/types";

interface Props {
  listing: Item | Sublet;
  listingPrice: number;
  listingOwnerLabel: string;
  priceLabel?: string;
  isOwner?: boolean;
}

type ModalState = "none" | "phone-input" | "verification" | "offer";

export const ListingActions = ({
  listing,
  listingPrice,
  priceLabel,
  listingOwnerLabel,
  isOwner = false,
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

  if (isOwner) {
    const typeLabel = listing.listing_type === "sublet" ? "Sublet" : "Item";
    const editHref =
      listing.listing_type === "sublet" ? `/sublets/${listing.id}/edit` : `/items/${listing.id}/edit`;

    return (
      <>
        <div className="flex items-center justify-end gap-2">
          <Button className="cursor-pointer" variant="outline" asChild>
            <Link href={editHref}>Edit Listing</Link>
          </Button>
          <Button
            className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete {typeLabel}
          </Button>
        </div>
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
