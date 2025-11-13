import { getSublets } from "@/lib/actions";
import { ListingsGrid } from "@/components/listings/ListingsGrid";

export default async function SubletsPage() {
  const sublets = await getSublets({ pageParam: 1 });

  return (
    <ListingsGrid type="sublets" listings={sublets} />
  );
}
