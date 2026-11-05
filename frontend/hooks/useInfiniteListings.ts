import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { Listing, PaginatedResponse } from "@/lib/types";

type UseInfiniteListingsParams = {
  queryKey: QueryKey;
  queryFn: (pageParam: unknown) => Promise<PaginatedResponse<Listing>>;
};

// infinite scrolling for listing lists outside the filtered feeds (profile, my listings,
// favorites). Paging matches useListings, so pages seeded on the server line up
export function useInfiniteListings({ queryKey, queryFn }: UseInfiniteListingsParams) {
  const { ref, inView } = useInView();

  const { data, error, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam),
    initialPageParam: 1,
    getNextPageParam(lastPage, allPages) {
      return lastPage.results.length > 0 ? allPages.length + 1 : undefined;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return {
    data,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    ref,
  };
}
