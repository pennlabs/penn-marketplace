import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import {
  getCurrentUser,
  getListing,
  getOffersMade,
  getOffersReceived,
  getUsersFavorites,
} from "@/lib/actions";

export default async function SubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sublet = await getListing(id);
  const currentUser = await getCurrentUser().catch(() => null);
  const isOwner = currentUser?.id === sublet.seller.id;
  const offersResponse = await (isOwner ? getOffersReceived() : getOffersMade()).catch(() => null);
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
