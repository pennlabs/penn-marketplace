import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import {
  getCurrentUser,
  getListingOrNotFound,
  getMyOfferForListing,
  getOffersReceivedForListing,
} from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // start both offer requests with the listing fetch instead of waiting to learn who owns it;
  // only the one for the viewer's role is awaited (the other's error is expected and ignored)
  const offersReceivedRequest = getOffersReceivedForListing(Number(id));
  const myOfferRequest = getMyOfferForListing(Number(id));
  offersReceivedRequest.catch(() => {});
  myOfferRequest.catch(() => {});

  const [item, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);
  const isOwner = currentUser?.id === item.seller.id;
  const offersReceivedResponse = isOwner ? await offersReceivedRequest : null;
  const myOfferGiven = !isOwner ? await myOfferRequest : null;

  // seed the cache with the already-fetched listing (no additional fetch).
  // We use setQueryData instead of prefetchQuery to preserve the notFound() throw above.
  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.listing(item.id), item);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListingDetail
        listingId={item.id}
        offersReceived={offersReceivedResponse}
        isOwner={isOwner}
        myOfferGiven={myOfferGiven}
      />
    </HydrationBoundary>
  );
}
