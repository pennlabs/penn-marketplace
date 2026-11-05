"use client";

import React, { ReactNode } from "react";
import { InfiniteData } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { ListingsCard } from "@/components/listings/ListingsCard";
import { Listing, PaginatedResponse, User } from "@/lib/types";
import { listingHref, mediaUrl } from "@/lib/utils";

// what useListings and useInfiniteListings both return
export type InfiniteListings = {
  data?: InfiniteData<PaginatedResponse<Listing>>;
  error: Error | null;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  ref: (node?: Element | null) => void;
};

type Props = {
  query: InfiniteListings;
  currentUser: User;
  emptyState: ReactNode;
};

// renders any mix of items and sublets; the caller owns the query
export const ListingsGridView = ({ query, currentUser, emptyState }: Props) => {
  const { data, error, isFetchingNextPage, hasNextPage, ref } = query;

  const totalResults = data?.pages.reduce((acc, page) => acc + page.results.length, 0) || 0;
  const isEmpty = totalResults === 0;

  if (error && totalResults === 0) {
    return (
      <div className="flex w-full flex-col items-center space-y-4 py-12">
        <p className="text-muted-foreground text-sm">
          Failed to load listings. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center space-y-4">
      <div className="w-full">
        {isEmpty && emptyState}
        {!isEmpty && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {data?.pages.map((group, i) => (
              <React.Fragment key={i}>
                {group.results.map((post) => {
                  const previewImageUrl = post.images?.[0]
                    ? mediaUrl(post.images[0].image_url)
                    : undefined;

                  return (
                    <ListingsCard
                      key={post.id}
                      listing={post}
                      previewImageUrl={previewImageUrl}
                      href={listingHref(post)}
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
