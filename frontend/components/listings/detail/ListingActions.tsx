"use client";

import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ListingActions = () => {
  const handleMakeOffer = () => {
    // TODO
  };

  return (
    <Button
      onClick={handleMakeOffer}
      className="w-full bg-brand hover:bg-brand-hover text-white h-12 text-base"
    >
      <DollarSign className="w-5 h-5" />
      Make an Offer
    </Button>
  );
}