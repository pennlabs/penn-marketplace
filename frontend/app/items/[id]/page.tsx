import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import {
  getCurrentUser,
  getListingOrNotFound,
  getMyOfferForListing,
  getOffersReceivedForListing,
} from "@/lib/actions";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);
  const isOwner = currentUser?.id === item.seller.id;
  const offersReceivedResponse = isOwner ? await getOffersReceivedForListing(item.id) : null;
  const offersReceived = offersReceivedResponse?.results ?? [];
  const myOfferGiven = !isOwner ? await getMyOfferForListing(item.id) : null;

  return (
    <ListingDetail
      listing={item}
      initialIsFavorited={item.is_favorited ?? false}
      offersReceived={offersReceived}
      isOwner={isOwner}
      myOfferGiven={myOfferGiven}
    />
  );
}
