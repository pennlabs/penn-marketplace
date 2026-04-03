"use client";

import Image from "next/image";
import { Check, Clock, Star, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Offer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { changeOfferStatus } from "@/lib/actions";
import { formatDateTime } from "@/lib/utils";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  accepted: { label: "Accepted", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

export const OfferCard = ({
  offer,
  onStatusChange,
}: {
  offer: Offer;
  onStatusChange: (id: number, status: Offer["status"]) => void;
}) => {
  const { date, time } = formatDateTime(offer.created_at);

  const mutation = useMutation({
    mutationFn: (status: Offer["status"]) => changeOfferStatus(offer.id, status),
    onSuccess: (_data: Offer, status: Offer["status"]) => {
      onStatusChange(offer.id, status);
    },
  });

  const badge = STATUS_BADGE[offer.status];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex gap-3">
        <Image
          src="/images/default-avatar.png"
          alt={`${offer.user.first_name} ${offer.user.last_name}`}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full"
        />
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
                  {date} at {time}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {offer.user.first_name} {offer.user.last_name}
            </span>
            <div className="flex items-center gap-0.5 text-sm text-gray-500">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>5.0</span>
            </div>
          </div>
          {offer.message && <p className="mt-1.5 text-sm text-gray-500">{offer.message}</p>}
          {offer.status === "pending" && (
            <div className="mt-3 flex justify-end gap-2">
              <Button
                size="sm"
                className="cursor-pointer bg-green-600 text-white hover:bg-green-700"
                onClick={() => mutation.mutate("accepted")}
                disabled={mutation.isPending}
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                {mutation.isPending && mutation.variables === "accepted" ? "Accepting..." : "Accept"}
              </Button>
              <Button
                size="sm"
                className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
                onClick={() => mutation.mutate("rejected")}
                disabled={mutation.isPending}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                {mutation.isPending && mutation.variables === "rejected" ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
