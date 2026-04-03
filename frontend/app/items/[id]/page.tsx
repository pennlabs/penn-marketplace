import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import { getListingOrNotFound } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getListingOrNotFound(id);

  // seed the cache with the already-fetched listing (no additional fetch).
  // We use setQueryData instead of prefetchQuery to preserve the notFound() throw above.
  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.listing(item.id), item);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListingDetail listingId={item.id} />
    </HydrationBoundary>
  );
}
