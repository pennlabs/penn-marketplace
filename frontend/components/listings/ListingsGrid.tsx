"use client";

import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Item } from "@/types/items";
import { Sublets } from "@/types/sublets";
import getItems from "@/actions/items";
import getSublets from "@/actions/sublets";
import { Spinner } from "../ui/spinner";
import Link from "next/link";

const QUERY_FNS = {
  items: getItems,
  sublets: getSublets,
} as const;

type Props =
  | {
    type: "items";
    listings: Item[];
  }
  | {
    type: "sublets";
    listings: Sublets[];
  };

export const ListingsGrid = ({ type, listings }: Props) => {
  const { ref, inView } = useInView();
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery<Item[] | Sublets[]>({
      queryKey: [type],
      queryFn: QUERY_FNS[type],
      placeholderData: { pages: [listings], pageParams: [1] },
      initialPageParam: 1,
      getNextPageParam(lastPage, allPages) {
        return lastPage.length > 0 ? allPages.length + 1 : undefined;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="grid gap-x-4 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <Link href={`/test`}>TEST</Link>
        {data?.pages.map((group, i) => (
          <React.Fragment key={i}>
            {group?.map((post) => (
              <div key={post.id} className="p-4 border rounded-md h-[250px] w-full max-w-[250px]">
                {post.title}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      {isFetchingNextPage && hasNextPage && (
        <Spinner />
      )}

      <div ref={ref} />
    </div>
  );
};
