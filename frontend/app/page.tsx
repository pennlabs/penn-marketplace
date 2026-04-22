import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getCurrentUser, getItems } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { PageHeader } from "@/components/common/PageHeader";
import { ItemFilters } from "@/components/filters/ItemFilters";
import { ListingsGrid } from "@/components/listings/ListingsGrid";

export default async function ItemsPage() {
  const queryClient = new QueryClient();

  const [, currentUser] = await Promise.all([
    queryClient.fetchInfiniteQuery({
      queryKey: queryKeys.listings("items"),
      queryFn: () => getItems({ pageParam: 1 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.results.length > 0 ? allPages.length + 1 : undefined,
      pages: 1,
    }),
    getCurrentUser(),
  ]);

  return (
    <div className="container mx-auto w-full max-w-[96rem] space-y-6 px-12 pt-6">
      <PageHeader title="Browse Items" description="Discover the latest items on sale at Penn" />
      <ItemFilters />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ListingsGrid type="items" currentUser={currentUser} />
      </HydrationBoundary>
    </div>
  );
}
