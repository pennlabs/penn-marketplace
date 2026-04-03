import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import { getCurrentUser, getListingOrNotFound, getMyOfferForListing, getOffersForListing } from "@/lib/actions";

export default async function SubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sublet, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);
  const isOwner = currentUser?.id === sublet.seller.id;
  const offersResponse = isOwner ? await getOffersForListing(sublet.id) : null;
  const offers = offersResponse?.results ?? [];
  const initialMyOffer = !isOwner ? await getMyOfferForListing(sublet.id) : null;

  return (
    <ListingDetail
      listing={sublet}
      initialIsFavorited={sublet.is_favorited ?? false}
      offers={offers}
      isOwner={isOwner}
      initialMyOffer={initialMyOffer}
    />
  );
}
