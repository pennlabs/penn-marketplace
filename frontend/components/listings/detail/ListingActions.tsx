"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { MakeOfferModal } from "@/components/listings/offer/MakeOfferModal";
import { PhoneInputModal } from "@/components/listings/offer/PhoneInputModal";
import { VerificationCodeModal } from "@/components/listings/offer/VerificationCodeModal";
import { Button } from "@/components/ui/button";
import { getPhoneStatus } from "@/lib/actions";

interface Props {
  listingId: number;
  listingPrice: number;
  listingTitle: string;
  listingOwnerLabel: string;
  priceLabel?: string;
}

type ModalState = "none" | "phone-input" | "verification" | "offer";

export const ListingActions = ({
  listingId,
  listingPrice,
  listingTitle,
  priceLabel,
  listingOwnerLabel
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
        className="w-full bg-brand hover:bg-brand-hover text-white h-12 text-base cursor-pointer"
      >
        <DollarSign className="w-5 h-5 mr-2" />
        Make an Offer
      </Button>

      <PhoneInputModal
        isOpen={modalState === "phone-input"}
        onClose={() => setModalState("none")}
        onCodeSent={handlePhoneCodeSent}
        listingOwnerLabel={listingOwnerLabel}
        initialPhoneNumber={isChangingPhone ? "" : (phoneStatus?.phone_number || "")}
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
        listingTitle={listingTitle}
        listingOwnerLabel={listingOwnerLabel}
        priceLabel={priceLabel}
        onChangePhone={handleChangePhone}
      />
    </>
  );
}