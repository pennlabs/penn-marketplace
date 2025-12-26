"use client";

import React from "react";
import { Item, PaginatedResponse, Sublet } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { ListingsCard } from "@/components/listings/ListingsCard";
import { useListings } from "@/hooks/useListings";

type Props =
  | {
    type: "items";
    listings: PaginatedResponse<Item>;
  }
  | {
    type: "sublets";
    listings: PaginatedResponse<Sublet>;
  };

export const ListingsGrid = ({ type, listings }: Props) => {
  const { data, isFetchingNextPage, hasNextPage, ref } = useListings({ type, listings });

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="w-full">
        <div className="grid gap-x-6 gap-y-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {data?.pages.map((group, i) => (
            <React.Fragment key={i}>
              {group.results.map((post) => {
                const previewImageUrl = post.images && post.images.length > 0
                  ? post.images[0]
                  : undefined;

                return (
                  <ListingsCard
                    key={post.id}
                    listing={post}
                    previewImageUrl={previewImageUrl}
                    href={`/${type}/${post.id}`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="min-h-4 flex items-center justify-center">
        {isFetchingNextPage && hasNextPage && (
          <Spinner />
        )}
      </div>
      <div ref={ref} />
    </div>
  );
};
