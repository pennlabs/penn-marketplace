import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getItems, getSublets } from "@/lib/actions";
import {
  Item,
  ListingTypes,
  ListingDataMap,
  PaginatedResponse,
  Sublet,
  Listing,
} from "@/lib/types";
import { useFilters } from "@/providers/FiltersProvider";

const LISTING_FETCHERS = {
  items: getItems,
  sublets: getSublets,
} as const;

export type UseListingsParams<T extends ListingTypes> = {
  type: T;
  listings: PaginatedResponse<ListingDataMap[T]>;
};

export function useListings<T extends ListingTypes>({
  type,
  listings,
}: UseListingsParams<T>) {
  const { ref, inView } = useInView();
  const { debouncedFilters } = useFilters();

  const filters = debouncedFilters[type];
  const queryKey = [type, "list", filters];

  const queryFn = ({ pageParam = 1 }: { pageParam: unknown }) =>
    LISTING_FETCHERS[type]({ pageParam, ...filters });

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (typeof value === "string") return value.trim() !== "";
    return value !== undefined;
  });

  const { data, error, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery<PaginatedResponse<Listing>>({
      queryKey,
      queryFn,
      initialData: hasActiveFilters
        ? undefined
        : { pages: [listings], pageParams: [1] },
      placeholderData: (previousData) => previousData,
      initialPageParam: 1,
      getNextPageParam(lastPage, allPages) {
        return lastPage.results.length > 0 ? allPages.length + 1 : undefined;
      },
      refetchOnWindowFocus: false,
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    });

  useEffect(() => {
    if (inView) {
      // this implements infinite scrolling (fetches next page when user scrolls to the bottom)
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
