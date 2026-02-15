import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import {
  getCurrentUser,
  getListing,
  getOffersMade,
  getOffersReceived,
  getUsersFavorites,
} from "@/lib/actions";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getListing(id);
  const favorites = await getUsersFavorites().catch(() => null);
  const currentUser = await getCurrentUser().catch(() => null);
  const isOwner = currentUser?.id === item.seller.id;
  const offersResponse = await (isOwner ? getOffersReceived() : getOffersMade()).catch(() => null);
  const offers = offersResponse?.results?.filter((offer) => offer.listing === item.id) ?? [];

  return (
    <ListingDetail
      listing={item}
      initialFavorites={favorites}
      offers={offers}
      offersMode={isOwner ? "received" : "made"}
      canEdit={isOwner}
    />
  );
}
