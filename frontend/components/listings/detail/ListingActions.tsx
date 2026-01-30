"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MakeOfferModal } from "@/components/listings/offer/MakeOfferModal";
import { PhoneInputModal } from "@/components/listings/offer/PhoneInputModal";
import { VerificationCodeModal } from "@/components/listings/offer/VerificationCodeModal";
import { Button } from "@/components/ui/button";
import { getPhoneStatus } from "@/lib/actions";

interface Props {
  listingId: number;
  listingPrice: number;
  listingOwnerLabel: string;
  priceLabel?: string;
}

type ModalState = "none" | "phone-input" | "verification" | "offer";

export const ListingActions = ({
  listingId,
  listingPrice,
  priceLabel,
  listingOwnerLabel,
}: Props) => {
  const [modalState, setModalState] = useState<ModalState>("none");
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string>("");
  const [isChangingPhone, setIsChangingPhone] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const { data: phoneStatus } = useQuery({
    queryKey: ["phoneStatus"],
    queryFn: getPhoneStatus,
  });

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
        listingId={listingId}
        listingPrice={listingPrice}
        listingOwnerLabel={listingOwnerLabel}
        priceLabel={priceLabel}
        onChangePhone={handleChangePhone}
      />
    </>
  );
};
