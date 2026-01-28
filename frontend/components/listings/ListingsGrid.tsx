"use client";

import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { ListingsCard } from "@/components/listings/ListingsCard";
import { NoListingsFound } from "@/components/listings/NoListingsFound";
import { useListings } from "@/hooks/useListings";
import { Item, PaginatedResponse, Sublet, User } from "@/lib/types";

type Props =
  | {
      type: "items";
      listings: PaginatedResponse<Item>;
      currentUser: User;
    }
  | {
      type: "sublets";
      listings: PaginatedResponse<Sublet>;
      currentUser: User;
    };

export const ListingsGrid = ({ type, listings, currentUser }: Props) => {
  const { data, isFetchingNextPage, hasNextPage, ref } = useListings({ type, listings });

  const totalResults = data?.pages.reduce((acc, page) => acc + page.results.length, 0) || 0;
  const isEmpty = totalResults === 0;

  return (
    <div className="flex w-full flex-col items-center space-y-4">
      <div className="w-full">
        {isEmpty && <NoListingsFound type={type} />}
        {!isEmpty && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {data?.pages.map((group, i) => (
              <React.Fragment key={i}>
                {group.results.map((post) => {
                  const previewImageUrl =
                    post.images && post.images.length > 0 ? post.images[0] : undefined;

                  return (
                    <ListingsCard
                      key={post.id}
                      listing={post}
                      previewImageUrl={previewImageUrl}
                      href={`/${type}/${post.id}`}
                      isMyListing={post.seller.id === currentUser.id}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      <div className="flex min-h-4 items-center justify-center">
        {isFetchingNextPage && hasNextPage && <Spinner />}
      </div>
      <div ref={ref} />
    </div>
  );
};
