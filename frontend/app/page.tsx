import { getItems } from "@/lib/actions";
import { ListingsGrid } from "@/components/listings/ListingsGrid";

export default async function ItemsPage() {
  const items = await getItems({ pageParam: 1 });

  return (
    <ListingsGrid type="items" listings={items} />
  );
}
