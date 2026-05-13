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
  const [item, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);
  const isOwner = currentUser?.id === item.seller.id;
  const offersReceivedResponse = isOwner ? await getOffersReceivedForListing(item.id) : null;
  const offersReceived = offersReceivedResponse?.results ?? [];
  const myOfferGiven = !isOwner ? await getMyOfferForListing(item.id) : null;

  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.listing(item.id), item);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListingDetail
        listing={item}
        initialIsFavorited={item.is_favorited ?? false}
        offersReceived={offersReceived}
        isOwner={isOwner}
        myOfferGiven={myOfferGiven}
      />
    </HydrationBoundary>
  );
}
