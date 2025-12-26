"use client";

import { useState } from "react";
import { Calendar, Bed, Bath } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Props {
  title: string;
  price: number;
  description: string;
  category?: string;
  condition?: string;
  priceLabel?: string;
  beds?: number;
  baths?: number;
  start_date?: string;
  end_date?: string;
}

const MAX_DESCRIPTION_LENGTH = 250;

export const ListingInfo = ({
  title,
  price,
  priceLabel,
  description,
  category,
  condition,
  beds,
  baths,
  start_date,
  end_date,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription =
    !shouldTruncate || isExpanded
      ? description
      : `${description.slice(0, MAX_DESCRIPTION_LENGTH)}...`;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-baseline gap-1">
        <p className="text-3xl font-bold text-brand">${price.toLocaleString()}</p>
        {priceLabel && <p className="text-lg text-gray-600">{priceLabel}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {category && <Badge variant="secondary">{category}</Badge>}
        {condition && <Badge variant="secondary">{condition}</Badge>}
        {start_date && end_date && (
          <div className="flex items-center gap-1.5 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {formatDate(start_date)} - {formatDate(end_date)}
            </span>
          </div>
        )}
        {/* check for undefined since they can have 0 beds or baths */}
        {beds !== undefined && (
          <div className="flex items-center gap-1.5 text-gray-700">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{beds} {beds === 1 ? 'bed' : 'beds'}</span>
          </div>
        )}
        {baths !== undefined && (
          <div className="flex items-center gap-1.5 text-gray-700">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{baths} {baths === 1 ? 'bath' : 'baths'}</span>
          </div>
        )}
      </div>
      <div className="space-y-2 pt-2">
        <h2 className="text-lg font-semibold">Description</h2>
        <div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {displayDescription}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-brand text-sm font-medium mt-1 hover:underline"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}