import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import { getListing, getUsersFavorites } from "@/lib/actions";

export default async function SubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sublet = await getListing(id);
  const favorites = await getUsersFavorites().catch(() => null);
  const isFavorited = Boolean(favorites?.results?.some((favorite) => favorite.id === sublet.id));

  return <ListingDetail listing={sublet} initialIsFavorited={isFavorited} />;
}
