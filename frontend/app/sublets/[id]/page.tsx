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
  // start both offer requests with the listing fetch instead of waiting to learn who owns it;
  // only the one for the viewer's role is awaited (the other's error is expected and ignored)
  const offersReceivedRequest = getOffersReceivedForListing(Number(id));
  const myOfferRequest = getMyOfferForListing(Number(id));
  offersReceivedRequest.catch(() => {});
  myOfferRequest.catch(() => {});

  const [sublet, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);
  const isOwner = currentUser?.id === sublet.seller.id;
  const offersReceivedResponse = isOwner ? await offersReceivedRequest : null;
  const myOfferGiven = !isOwner ? await myOfferRequest : null;

  // seed the cache with the already-fetched listing (no additional fetch).
  // We use setQueryData instead of prefetchQuery to preserve the notFound() throw above.
  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.listing(sublet.id), sublet);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListingDetail
        listingId={sublet.id}
        offersReceived={offersReceivedResponse}
        isOwner={isOwner}
        myOfferGiven={myOfferGiven}
      />
    </HydrationBoundary>
  );
}
