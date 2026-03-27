import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import { getListingOrNotFound } from "@/lib/actions";

export default async function SubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sublet = await getListingOrNotFound(id);

  return <ListingDetail listing={sublet} initialIsFavorited={sublet.is_favorited ?? false} />;
}
