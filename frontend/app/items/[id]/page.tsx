import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import { getListing } from "@/lib/actions";

export default async function ItemPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const item = await getListing(id);

  return <ListingDetail listing={item} />;
}