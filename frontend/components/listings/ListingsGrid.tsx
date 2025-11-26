"use client";

import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getItems } from "@/lib/actions";
import { getSublets } from "@/lib/actions";
import { Item, PaginatedResponse } from "@/lib/types";
import { Sublets } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { ListingsCard } from "@/components/listings/ListingsCard";
import { ListingCategory, ListingCondition } from "@/lib/types";

const QUERY_FNS = {
  items: getItems,
  sublets: getSublets,
} as const;

type Props =
  | {
    type: "items";
    listings: PaginatedResponse<Item>;
  }
  | {
    type: "sublets";
    listings: PaginatedResponse<Sublets>;
  };

export const ListingsGrid = ({ type, listings }: Props) => {
  const { ref, inView } = useInView();
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery<PaginatedResponse<Item | Sublets>>({
      queryKey: [type],
      queryFn: QUERY_FNS[type],
      initialData: { pages: [listings], pageParams: [1] },
      initialPageParam: 1,
      getNextPageParam(lastPage, allPages) {
        return lastPage.results.length > 0 ? allPages.length + 1 : undefined;
      },
      refetchOnWindowFocus: false,
      staleTime: 1 * 60 * 1000, // 1 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="w-full max-w-7xl px-4">
        <div className="grid gap-x-6 gap-y-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data?.pages.map((group, i) => {
            return (
              <React.Fragment key={i}>
                {group?.results?.map((post, index) => (
                  <ListingsCard
                    key={index}
                    price={100}
                    title={"Test item"}
                    listingCategory={ListingCategory.ART}
                    condition={ListingCondition.NEW}
                    href={`/${type}/${post.id}`}
                  />
                ))}
              </React.Fragment>
            )
          })}
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
