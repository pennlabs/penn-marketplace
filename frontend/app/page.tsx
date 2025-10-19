import getItems from "@/actions/items";
import { ListingsGrid } from "@/components/listings/ListingsGrid";

export default async function Home() {
  const items = await getItems({ pageParam: 1 });

  return (
    <ListingsGrid type="items" listings={items} />
  );
}
