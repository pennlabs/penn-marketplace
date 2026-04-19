"use client";

import { Pencil, Trash2, Clock, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Offer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatServerDateTimeToLocal } from "@/lib/utils";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  accepted: { label: "Accepted", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

export function MyOfferCard({
  offer,
  onEdit,
  onDelete,
}: {
  offer: Offer;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { data: localCreatedAt } = useQuery({
    queryKey: ["localDateTime", offer.created_at],
    queryFn: () => formatServerDateTimeToLocal(offer.created_at),
    staleTime: Infinity,
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
            <span className="text-lg font-semibold">
              ${offer.offered_price.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              {badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>
                  {localCreatedAt ? `${localCreatedAt.date} at ${localCreatedAt.time}` : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">Your message</span>
          </div>

          <p className="mt-1.5 text-sm text-gray-500">
            {offer.message?.trim() ? offer.message : "No message provided."}
          </p>

          <div className="mt-3 flex justify-end gap-2">
            <Button
              size="sm"
              className="cursor-pointer"
              variant="outline"
              onClick={onEdit}
            >
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              size="sm"
              className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
              onClick={onDelete}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Withdraw
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

