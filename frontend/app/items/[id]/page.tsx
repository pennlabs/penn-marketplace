import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import { getListingOrNotFound } from "@/lib/actions";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getListingOrNotFound(id);

  return <ListingDetail listing={item} initialIsFavorited={item.is_favorited ?? false} />;
}
