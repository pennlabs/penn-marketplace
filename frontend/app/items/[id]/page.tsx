import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import { getListing, getUsersFavorites } from "@/lib/actions";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getListing(id);
  const favorites = await getUsersFavorites().catch(() => null);
  const isFavorited = Boolean(favorites?.results?.some((favorite) => favorite.id === item.id));

  return <ListingDetail listing={item} initialIsFavorited={isFavorited} />;
}
