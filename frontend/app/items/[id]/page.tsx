import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import { getCurrentUser, getListingOrNotFound, getMyOfferForListing, getOffersForListing } from "@/lib/actions";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);
  const isOwner = currentUser?.id === item.seller.id;
  const offersResponse = isOwner ? await getOffersForListing(item.id) : null;
  const offers = offersResponse?.results ?? [];
  const initialMyOffer = !isOwner ? await getMyOfferForListing(item.id) : null;

  return (
    <ListingDetail
      listing={item}
      initialIsFavorited={item.is_favorited ?? false}
      offers={offers}
      isOwner={isOwner}
      initialMyOffer={initialMyOffer}
    />
  );
}
