import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getCurrentUser, getUsersFavorites } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { PageHeader } from "@/components/common/PageHeader";
import { FavoritesGrid } from "@/components/listings/FavoritesGrid";

export const metadata: Metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  const queryClient = new QueryClient();

  const [, currentUser] = await Promise.all([
    queryClient.fetchInfiniteQuery({
      queryKey: queryKeys.favorites(),
      queryFn: () => getUsersFavorites({ pageParam: 1 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.results.length > 0 ? allPages.length + 1 : undefined,
      pages: 1,
    }),
    getCurrentUser(),
  ]);

  return (
    <>
      <PageHeader title="Favorites" description="Listings you've saved" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <FavoritesGrid currentUser={currentUser} />
      </HydrationBoundary>
    </>
  );
}
