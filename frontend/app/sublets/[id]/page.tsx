import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import {
  getCurrentUser,
  getListingOrNotFound,
  getMyOfferForListing,
  getOffersReceivedForListing,
} from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";

export default async function SubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sublet, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);
  const isOwner = currentUser?.id === sublet.seller.id;
  const offersReceivedResponse = isOwner ? await getOffersReceivedForListing(sublet.id) : null;
  const offersReceived = offersReceivedResponse?.results ?? [];
  const myOfferGiven = !isOwner ? await getMyOfferForListing(sublet.id) : null;

  // seed the cache with the already-fetched listing (no additional fetch).
  // We use setQueryData instead of prefetchQuery to preserve the notFound() throw above.
  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.listing(sublet.id), sublet);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListingDetail
        listingId={sublet.id}
        offersReceived={offersReceived}
        isOwner={isOwner}
        myOfferGiven={myOfferGiven}
      />
    </HydrationBoundary>
  );
}
