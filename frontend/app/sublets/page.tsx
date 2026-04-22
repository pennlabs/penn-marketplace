import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getCurrentUser, getSublets } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { PageHeader } from "@/components/common/PageHeader";
import { SubletFilters } from "@/components/filters/SubletFilters";
import { ListingsGrid } from "@/components/listings/ListingsGrid";

export default async function SubletsPage() {
  const queryClient = new QueryClient();

  const [, currentUser] = await Promise.all([
    queryClient.fetchInfiniteQuery({
      queryKey: queryKeys.listings("sublets"),
      queryFn: () => getSublets({ pageParam: 1 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.results.length > 0 ? allPages.length + 1 : undefined,
      pages: 1,
    }),
    getCurrentUser(),
  ]);

  return (
    <div className="container mx-auto w-full max-w-[96rem] space-y-6 px-12 pt-6">
      <PageHeader title="Browse Sublets" description="Find your perfect housing solution at Penn" />
      <SubletFilters />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ListingsGrid type="sublets" currentUser={currentUser} />
      </HydrationBoundary>
    </div>
  );
}
