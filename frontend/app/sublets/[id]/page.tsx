import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import {
  getCurrentUser,
  getListingOrNotFound,
  getOffersMade,
  getOffersReceived,
} from "@/lib/actions";

export default async function SubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sublet, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);
  const isOwner = currentUser?.id === sublet.seller.id;
  const offersResponse = await (isOwner ? getOffersReceived() : getOffersMade());
  const offers = offersResponse?.results?.filter((offer) => offer.listing === sublet.id) ?? [];

  return (
    <ListingDetail
      listing={sublet}
      initialIsFavorited={sublet.is_favorited ?? false}
      offers={offers}
      offersMode={isOwner ? "received" : "made"}
      canEdit={isOwner}
    />
  );
}
