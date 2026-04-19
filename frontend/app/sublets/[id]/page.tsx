import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import {
  getCurrentUser,
  getListingOrNotFound,
  getMyOfferForListing,
  getOffersReceivedForListing,
} from "@/lib/actions";

export default async function SubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sublet, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);
  const isOwner = currentUser?.id === sublet.seller.id;
  const offersReceivedResponse = isOwner ? await getOffersReceivedForListing(sublet.id) : null;
  const offersReceived = offersReceivedResponse?.results ?? [];
  const myOfferGiven = !isOwner ? await getMyOfferForListing(sublet.id) : null;

  return (
    <ListingDetail
      listing={sublet}
      initialIsFavorited={sublet.is_favorited ?? false}
      offersReceived={offersReceived}
      isOwner={isOwner}
      myOfferGiven={myOfferGiven}
    />
  );
}
