import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import { getListing, getUsersFavorites } from "@/lib/actions";

export default async function SubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sublet = await getListing(id);
  const favorites = await getUsersFavorites().catch(() => null);

  return <ListingDetail listing={sublet} initialFavorites={favorites} />;
}
