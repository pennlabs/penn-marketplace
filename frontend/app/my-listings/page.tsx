import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getCurrentUser, getMyListings } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { PageHeader } from "@/components/common/PageHeader";
import { MyListingsGrid } from "@/components/listings/MyListingsGrid";
import { MyListingsTabs } from "@/components/listings/MyListingsTabs";

export const metadata: Metadata = { title: "My Listings" };

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { tab } = await searchParams;
  const expired = tab === "expired";
  const queryClient = new QueryClient();

  const [, currentUser] = await Promise.all([
    queryClient.fetchInfiniteQuery({
      queryKey: queryKeys.myListings(expired),
      queryFn: () => getMyListings({ expired, pageParam: 1 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.results.length > 0 ? allPages.length + 1 : undefined,
      pages: 1,
    }),
    getCurrentUser(),
  ]);

  return (
    <>
      <PageHeader title="My Listings" description="Items and sublets you've posted" />
      <MyListingsTabs expired={expired} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MyListingsGrid expired={expired} currentUser={currentUser} />
      </HydrationBoundary>
    </>
  );
}
